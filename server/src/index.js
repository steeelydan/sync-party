require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const Sequelize = require('sequelize');

const morgan = require('morgan');

const socketio = require('socket.io');
const express = require('express');

const helmet = require('helmet');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(
    expressSession.Store
);
// const csurf = require('csurf'); TBI
const compression = require('compression');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const configurePassport = require('./middleware/passport');
const configureSession = require('./middleware/session');
const rateLimiters = require('./middleware/rateLimiters');
const { isAuthenticated, isAdmin } = require('./middleware/auth');

const authController = require('./controllers/authController');
const fileController = require('./controllers/fileController');
const mediaItemController = require('./controllers/mediaItemController');
const userController = require('./controllers/userController');
const partyController = require('./controllers/partyController');
const partyItemController = require('./controllers/partyItemController');
const partyMetadataController = require('./controllers/partyMetadataController');
const userPartyController = require('./controllers/userPartyController');
const userItemController = require('./controllers/userItemController');

const helpers = require('./common/helpers');
const createModels = require('./database/createModels');

// Config
const port = process.env.PORT || 4000;

// Init app
const app = express();

const runApp = async () => {
    // LOGGING
    const logger = helpers.createLogger();
    app.use(
        morgan(
            ':remote-addr - :remote-user :method :url HTTP/:http-version :status :res[content-length] :referrer :user-agent - :response-time ms',
            { stream: logger.stream }
        )
    );

    // Check environment variables
    helpers.envCheck(logger);

    // DATABASE

    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './db',
        logging: false
    });

    const models = createModels(Sequelize, sequelize);

    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
        logger.log('error', error);
    }

    // HTTP(S) SERVER

    let server;
    if (
        process.env.NODE_ENV !== 'production' ||
        process.env.USE_SSL !== 'true'
    ) {
        server = http.createServer(app);
    } else {
        const redirectionToHttpsApp = express();
        redirectionToHttpsApp.get('*', (req, res) => {
            res.redirect(301, process.env.URL);
        });
        redirectionToHttpsApp.listen(80, () => {
            logger.log('info', 'HTTPS Redirection server is listening');
        });

        server = https.createServer(
            {
                key: fs.readFileSync(process.env.SSL_KEY_PATH),
                cert: fs.readFileSync(process.env.SSL_CERT_PATH),
                ca: fs.readFileSync(process.env.SSL_CHAIN_PATH)
            },
            app
        );
    }

    // DEFAULT VALUES

    const currentSyncStatus = {};
    const currentPlayWishes = {};

    // MIDDLEWARE

    app.use(helmet());
    app.use(compression());

    // HTTP HEADERS

    // TODO: Consider cors package

    app.use((req, res, next) => {
        if (process.env.CORS_ALLOW) {
            res.header('Access-Control-Allow-Origin', process.env.CORS_ALLOW);
        }
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
            'Access-Control-Allow-Headers',
            'X-Requested-With, Authorization, Content-Type, Accept, X-CSRF-Token'
        );
        res.header(
            'Access-Control-Allow-Methods',
            'POST, GET, DELETE, OPTIONS, PUT'
        );

        next();
    });

    // Static files middleware
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client-build')));
    }

    // Parser middleware
    app.use(bodyParser.json());
    app.use(cookieParser(process.env.SESSION_SECRET));

    // Session & Auth

    const { session, sessionStore } = configureSession(
        sequelize,
        SequelizeStore,
        expressSession
    );
    app.use(session);

    const passport = configurePassport(models, logger);

    app.use(passport.initialize());
    app.use(passport.session());

    // TBI
    // app.use(
    //     csurf({
    //         cookie: { key: '_csrf', signed: false }
    //     })
    // );

    // CSRF Error Handler
    // app.use((err, req, res, next) => {
    //     if (err.code !== 'EBADCSRFTOKEN') return next(err);
    //     logger.log(
    //         'info',
    //         `Invalid CSRF token. User ID: ${
    //             req.user ? req.user.id : '(no session)'
    //         }`
    //     );
    //     return res.status(403).json({
    //         success: false,
    //         msg: 'csrfToken'
    //     });
    // });

    // WEBSOCKETS

    const io = socketio(server, { cookie: false });

    // Apply session middleware to socket
    io.use(
        passportSocketIo.authorize({
            key: 'connect.sid',
            secret: process.env.SESSION_SECRET,
            store: sessionStore,
            passport: passport,
            cookieParser: cookieParser
        })
    );

    // Socket listeners
    io.on('connection', (socket) => {
        const socketUserId = socket.request.user.id;
        logger.log(
            'info',
            `Web Sockets: New connection, userId: ${socketUserId}`
        );

        socket.on('disconnect', () => {
            socket.leaveAll();
            logger.log(
                'info',
                `Web Sockets: User disconnected: ${socketUserId}`
            );
        });

        const joinParty = (data) => {
            io.in(data.partyId).clients(async (err, clients) => {
                if (!clients.includes(socketUserId)) {
                    try {
                        const party = await models.Party.findOne({
                            where: {
                                id: data.partyId
                            }
                        });

                        if (!party || !party.members.includes(socketUserId)) {
                            return Promise.reject(
                                new Error('User not member in party')
                            );
                        }
                    } catch (error) {
                        logger.log('error', error);
                    }

                    socket.join(data.partyId);

                    socket.emit(
                        'serverTimeOffset',
                        Date.now() - data.timestamp
                    );

                    logger.log(
                        'info',
                        `Web Sockets: User ${socketUserId} joined party ${data.partyId}`
                    );

                    if (currentPlayWishes[data.partyId]) {
                        socket.emit(
                            'playOrder',
                            currentPlayWishes[data.partyId]
                        );
                    }

                    return Promise.resolve();
                } else {
                    return Promise.reject(
                        new Error('User already joined the party')
                    );
                }
            });
        };

        socket.on('joinParty', (data) => {
            joinParty(data);
        });

        socket.on('leaveParty', (data) => {
            socket.leave(data.partyId);

            logger.log(
                'info',
                `Web Sockets: User ${socketUserId} left party ${data.partyId}`
            );
        });

        socket.on('playWish', (playWish) => {
            const playWishWithNormalizedTimestamp = {
                ...playWish,
                timestamp:
                    playWish.timestamp + (Date.now() - playWish.timestamp)
            };

            currentPlayWishes[
                playWish.partyId
            ] = playWishWithNormalizedTimestamp;
            // Only emitted to party members
            io.to(playWish.partyId).emit(
                'playOrder',
                playWishWithNormalizedTimestamp
            );
        });

        socket.on('partyUpdate', (partyUpdateData) => {
            // Update emitted to all connected users, in order to make sure dashboard is updated etc.
            io.emit('partyUpdate', partyUpdateData);
        });

        socket.on('mediaItemUpdate', (empty) => {
            // Update emitted to all connected users, in order to make sure dashboard is updated etc.
            io.emit('mediaItemUpdate', empty);
        });

        socket.on('syncStatus', (userSyncStatus) => {
            currentSyncStatus[userSyncStatus.partyId] =
                currentSyncStatus[userSyncStatus.partyId] || {};
            currentSyncStatus[userSyncStatus.partyId][userSyncStatus.userId] = {
                isPlaying: userSyncStatus.isPlaying,
                timestamp: userSyncStatus.timestamp,
                position: userSyncStatus.position,
                serverTimeOffset: Date.now() - userSyncStatus.timestamp
            };

            // Only emitted to party members
            io.to(userSyncStatus.partyId).emit(
                'syncStatus',
                currentSyncStatus[userSyncStatus.partyId]
            );
        });
    });

    // API Endpoints

    // Auth & login

    app.post('/api/auth', rateLimiters.authRateLimiter, async (req, res) => {
        authController.auth(req, res, logger);
    });

    app.post(
        '/api/login',
        rateLimiters.authRateLimiter,
        passport.authenticate('local'),
        (req, res) => {
            authController.login(req, res, logger);
        }
    );

    app.post('/api/logout', isAuthenticated, async (req, res) => {
        authController.logout(req, res, logger);
    });

    // MediaItems

    app.get('/api/allMediaItems', isAuthenticated, isAdmin, (req, res) => {
        mediaItemController.getAllMediaItems(req, res, models, logger);
    });

    app.post('/api/mediaItem', isAuthenticated, async (req, res) => {
        mediaItemController.createMediaItem(req, res, models, logger);
    });

    app.put('/api/mediaItem/:id', isAuthenticated, (req, res) => {
        mediaItemController.editMediaItem(req, res, models, logger);
    });

    app.delete('/api/mediaItem/:id', isAuthenticated, async (req, res) => {
        mediaItemController.deleteMediaItem(req, res, models);
    });

    // UserItems

    app.get('/api/userItems', isAuthenticated, async (req, res) => {
        userItemController.getUserItems(req, res, models, logger);
    });

    // Files

    app.get('/api/file/:id', isAuthenticated, (req, res) => {
        fileController.getFile(req, res, models, helpers);
    });

    app.post('/api/file', isAuthenticated, (req, res) => {
        fileController.upload(req, res, models, logger);
    });

    // Users

    app.get('/api/allUsers', isAuthenticated, isAdmin, (req, res) => {
        userController.getAllUsers(req, res, models);
    });

    // Parties

    app.post('/api/party', isAuthenticated, isAdmin, (req, res) => {
        partyController.createParty(req, res, models, logger);
    });

    app.put('/api/party', isAuthenticated, isAdmin, (req, res) => {
        partyController.editParty(req, res, models, logger);
    });

    // User Parties

    app.get('/api/userParties', isAuthenticated, (req, res) => {
        userPartyController.getUserParties(req, res, models);
    });

    // Party items

    app.delete('/api/partyItems', isAuthenticated, async (req, res) => {
        partyItemController.removeItemFromParty(req, res, models);
    });

    app.post('/api/partyItems', isAuthenticated, async (req, res) => {
        partyItemController.addItemToParty(req, res, models, logger);
    });

    app.put('/api/partyItems', isAuthenticated, async (req, res) => {
        partyItemController.updatePartyItems(req, res, models, logger);
    });

    // Party metadata

    app.put('/api/partyMetadata', isAuthenticated, async (req, res) => {
        partyMetadataController.updatePartyMetadata(req, res, models, logger);
    });

    // Route everything not caught by above routes to index.html
    if (process.env.NODE_ENV === 'production') {
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../client-build', 'index.html'));
        });
    }

    // Start server

    server.listen(port, () => {
        logger.log('info', `App listening on port ${port}`);
    });
};

runApp();
