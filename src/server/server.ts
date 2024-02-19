import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { v4 as uuid } from 'uuid';
import express from 'express';
import { CronJob } from 'cron';
import { ExpressPeerServer } from 'peer';
import { Server as SocketIoServer } from 'socket.io';

import { setupEnvironment } from './core/environment/environment.js';
import { setupHeaders } from './core/headers/headers.js';
import { useCompression } from './core/performance/performance.js';
import { setupRequestParsers } from './core/requestParsers/requestParsers.js';
import { setupSession } from './core/session/session.js';
import { createGeneralLogger } from './core/logger/generalLogger.js';
import { createDatabase } from './core/database/database.js';
import { setupAuthentication } from './core/authentication/setup.js';
import { createRateLimiter } from './core/rateLimiting/rateLimiting.js';

import dbConfig from './dbConfig.cjs';
import { initModels } from './database/initModels.js';
import { Party } from './models/Party.js';
import { User } from './models/User.js';

import { pathConfig, requiredEnvVars, validEnvValues } from './constants.js';

import {
    mustBeAdmin,
    mustBeAuthenticated
} from './core/authentication/middleware.js';
import { authenticateSocketRequest } from './middleware/socketMiddleware.js';

import { authController } from './controllers/authController.js';
import { fileController } from './controllers/fileController.js';
import { mediaItemController } from './controllers/mediaItemController.js';
import { userController } from './controllers/userController.js';
import { partyController } from './controllers/partyController.js';
import { partyItemController } from './controllers/partyItemController.js';
import { partyMetadataController } from './controllers/partyMetadataController.js';
import { userPartyController } from './controllers/userPartyController.js';
import { userItemController } from './controllers/userItemController.js';
import { externalDataController } from './controllers/externalDataController.js';

import type {
    ChatMessage,
    JoinPartyMessage,
    LeavePartyMessage,
    MediaItemUpdateMessage,
    PartyUpdateMessage,
    PlayWish,
    SyncStatus,
    SyncStatusOutgoingMessage,
    DbConfig,
    WebRtcJoinLeaveMessage
} from '../shared/types.js';
import type { Socket } from 'socket.io';

const sslDevCert = fs.readFileSync(
    path.resolve('ssl-dev/server.cert'),
    'utf-8'
);
const sslDevKey = fs.readFileSync(path.resolve('ssl-dev/server.key'), 'utf-8');

setupEnvironment(pathConfig, requiredEnvVars, validEnvValues);

const rateLimiter = createRateLimiter(200);

if (!fs.existsSync(path.resolve('data/uploads'))) {
    fs.mkdirSync(path.resolve('data/uploads'), { recursive: true });
}

if (!process.env.SERVER_PORT || !process.env.WEBSOCKETS_PORT) {
    throw new Error('SERVER_PORT or WEBSOCKETS_PORT env var missing');
}

const webRtcServerKey = uuid();

const app = express();

const logger = createGeneralLogger(pathConfig);

const sequelize = await createDatabase(dbConfig as DbConfig);

initModels(sequelize);

try {
    await sequelize.sync({ alter: true });
} catch (error) {
    logger.log('error', error);
}

// HTTP(S) SERVER

const server =
    process.env.NODE_ENV === 'development'
        ? https.createServer({ cert: sslDevCert, key: sslDevKey }, app)
        : http.createServer(app);

// DEFAULT VALUES

const persistentValues = fs.existsSync(path.resolve('data/persistence.json'))
    ? JSON.parse(
          fs.readFileSync(path.resolve('data/persistence.json'), 'utf-8')
      )
    : {
          currentPlayWishes: {},
          lastPositions: {}
      };

const currentSyncStatus: {
    [partyId: string]: { [userId: string]: SyncStatus };
} = {};

const currentPlayWishes: {
    [partyId: string]: PlayWish;
} = persistentValues.currentPlayWishes;

const lastPositions: {
    [partyId: string]: { [itemId: string]: number };
} = persistentValues.lastPositions;

new CronJob(
    '*/15 * * * *',
    () => {
        fs.writeFileSync(
            path.resolve('data/persistence.json'),
            JSON.stringify({
                currentPlayWishes,
                lastPositions
            })
        );
    },
    null,
    false
).start();

// MIDDLEWARE

setupHeaders(app, {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            scriptSrc:
                "'self' 'unsafe-inline' www.youtube.com s.ytimg.com player.vimeo.com w.soundcloud.com",
            connectSrc: ["'self' *"],
            mediaSrc: ['*'],
            frameSrc: ['www.youtube.com w.soundcloud.com player.vimeo.com'],
            scriptSrcAttr: ["'none'"],
            styleSrc: "'self' https: 'unsafe-inline'"
        }
    }
});

useCompression(app);

// HTTP HEADERS

// TODO: Consider cors package

app.use((req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
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

app.use(rateLimiter);

// Static files middleware
app.use(express.static(path.resolve('build/public')));

setupRequestParsers(app);

// Session & Auth

const { sessionMiddleware } = setupSession(
    app,
    sequelize,
    365 * 24 * 60 * 60 * 1000
);

const { passport } = setupAuthentication(app);

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

// WEBSOCKETS SERVER

const socketServer =
    process.env.NODE_ENV === 'development'
        ? https.createServer({
              key: sslDevKey,
              cert: sslDevCert
          })
        : http.createServer();

const io = new SocketIoServer(socketServer, {
    transports: ['websocket'],
    cors:
        process.env.NODE_ENV === 'development'
            ? {
                  origin: 'https://localhost:3000',
                  methods: ['GET']
              }
            : undefined
});

authenticateSocketRequest(io, sessionMiddleware, passport);

// Socket listeners
io.on('connection', (socket: Socket) => {
    // @ts-ignore Fixme user on request
    const socketUserId = socket.request.user.id;

    logger.log('info', `Web Sockets: New connection, userId: ${socketUserId}`);

    const joinParty = async (data: { partyId: string; timestamp: number }) => {
        const members: Set<string> = await io.in(data.partyId).allSockets();

        if (!members.has(socketUserId)) {
            try {
                const party = await Party.findOne({
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

            socket.emit('serverTimeOffset', Date.now() - data.timestamp);

            logger.log(
                'info',
                `Web Sockets: User ${socketUserId} joined party ${data.partyId}`
            );

            if (currentPlayWishes[data.partyId]) {
                socket.emit('playOrder', currentPlayWishes[data.partyId]);
            }

            return Promise.resolve();
        } else {
            return Promise.reject(new Error('User already joined the party'));
        }
    };

    socket.on('joinParty', async (data: JoinPartyMessage) => {
        await joinParty(data);
    });

    socket.on('leaveParty', (data: LeavePartyMessage) => {
        socket.leave(data.partyId);

        logger.log(
            'info',
            `Web Sockets: User ${socketUserId} left party ${data.partyId}`
        );
    });

    socket.on('playWish', (playWish: PlayWish) => {
        const playWishWithNormalizedTimestamp = {
            ...playWish,
            timestamp: playWish.timestamp + (Date.now() - playWish.timestamp)
        };

        // Save position of previous item, if delivered
        if (playWish.lastPosition && playWish.lastPosition.position > 0) {
            if (!lastPositions[playWish.partyId]) {
                lastPositions[playWish.partyId] = {};
            }

            lastPositions[playWish.partyId][playWish.lastPosition.itemId] =
                playWish.lastPosition.position;
        }

        // Attach last position of the requested item
        if (
            playWishWithNormalizedTimestamp.requestLastPosition &&
            lastPositions[playWish.partyId] &&
            lastPositions[playWish.partyId][
                playWishWithNormalizedTimestamp.mediaItemId
            ]
        ) {
            playWishWithNormalizedTimestamp.lastPosition = {
                itemId: playWishWithNormalizedTimestamp.mediaItemId,
                position:
                    lastPositions[playWishWithNormalizedTimestamp.partyId][
                        playWishWithNormalizedTimestamp.mediaItemId
                    ]
            };
        } else {
            if (playWishWithNormalizedTimestamp.lastPosition) {
                delete playWishWithNormalizedTimestamp.lastPosition;
            }
        }

        currentPlayWishes[playWish.partyId] = playWishWithNormalizedTimestamp;
        // Only emitted to party members
        io.to(playWish.partyId).emit(
            'playOrder',
            playWishWithNormalizedTimestamp
        );
    });

    socket.on('partyUpdate', (partyUpdateData: PartyUpdateMessage) => {
        // Update emitted to all connected users, in order to make sure dashboard is updated etc.
        io.emit('partyUpdate', partyUpdateData);
    });

    socket.on('mediaItemUpdate', (empty: MediaItemUpdateMessage) => {
        // Update emitted to all connected users, in order to make sure dashboard is updated etc.
        io.emit('mediaItemUpdate', empty);
    });

    socket.on('syncStatus', (userSyncStatus: SyncStatusOutgoingMessage) => {
        currentSyncStatus[userSyncStatus.partyId] =
            currentSyncStatus[userSyncStatus.partyId] || {};
        currentSyncStatus[userSyncStatus.partyId][userSyncStatus.userId] = {
            isPlaying: userSyncStatus.isPlaying,
            timestamp: userSyncStatus.timestamp,
            position: userSyncStatus.position,
            serverTimeOffset: Date.now() - userSyncStatus.timestamp,
            webRtc: userSyncStatus.webRtc
        };

        // Only emitted to party members
        io.to(userSyncStatus.partyId).emit(
            'syncStatus',
            currentSyncStatus[userSyncStatus.partyId]
        );
    });

    socket.on('chatMessage', (chatMessage: ChatMessage) => {
        io.to(chatMessage.partyId).emit('chatMessage', chatMessage);
    });

    // WebRTC
    socket.on('joinWebRtc', (data: WebRtcJoinLeaveMessage) => {
        io.to(data.partyId).emit('joinWebRtc', data.webRtcId);
    });

    socket.on('leaveWebRtc', (data: WebRtcJoinLeaveMessage) => {
        io.to(data.partyId).emit('leaveWebRtc', {
            webRtcId: data.webRtcId
        });
    });

    // Disconnect
    socket.on('disconnected', () => {
        logger.log('info', `Web Sockets: User disconnected: ${socketUserId}`);
    });
});

// WebRTC

const peerServer = ExpressPeerServer(server, {
    // debug: true,
    key: webRtcServerKey
});

app.use('/peerjs', mustBeAuthenticated, peerServer);

peerServer.on('connection', async (client) => {
    const requestWebRtcId = client.getId();
    const allParties = await Party.findAll();
    let isInActiveParty = false;
    let userId = '';

    for (const party of allParties) {
        const partyWebRtcIds = party.settings.webRtcIds;

        if (partyWebRtcIds) {
            for (const partyUserId of Object.keys(partyWebRtcIds)) {
                const partyUserWebRtcId = partyWebRtcIds[partyUserId];

                if (
                    partyUserWebRtcId === requestWebRtcId ||
                    party.status === 'active'
                ) {
                    isInActiveParty = true;
                    userId = partyUserId;
                    break;
                }
            }
        }

        if (isInActiveParty) {
            break;
        }
    }

    const user = await User.findOne({
        where: { id: userId }
    });

    if (!isInActiveParty || !user) {
        client.getSocket()?.close();
        logger.log('error', `PeerJS: Client denied: ${requestWebRtcId}`);

        return;
    }

    logger.log(
        'info',
        `PeerJS: client connected: ${requestWebRtcId} (userId: ${user.id}, username: ${user.username})`
    );
});

peerServer.on('disconnect', (client) => {
    logger.log('info', `PeerJS: client disconnected: ${client.getId()}`);
});

// API Endpoints

// Auth & login

app.post('/api/auth', async (req, res) => {
    await authController.auth(req, res, logger);
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
    authController.login(req, res);
});

app.post('/api/logout', mustBeAuthenticated, async (req, res) => {
    await authController.logout(req, res, logger);
});

// WebRTC Key
app.post('/api/webRtcServerKey', mustBeAuthenticated, async (req, res) => {
    const partyId = req.body.partyId;
    const userId = req.body.userId;
    const webRtcId = req.body.webRtcId;
    const party = await Party.findOne({
        where: { id: partyId }
    });
    const user = await User.findOne({
        where: { id: userId }
    });

    if (
        !party ||
        party.settings.webRtcIds[userId] !== webRtcId ||
        !party.members.includes(userId) ||
        !user
    ) {
        return res.status(401);
    }

    return res.json({ webRtcServerKey });
});

// MediaItems

app.get(
    '/api/allMediaItems',
    mustBeAuthenticated,
    mustBeAdmin,
    async (req, res) => {
        await mediaItemController.getAllMediaItems(req, res, logger);
    }
);

app.post('/api/mediaItem', mustBeAuthenticated, async (req, res) => {
    await mediaItemController.createMediaItem(req, res, logger);
});

app.put('/api/mediaItem/:id', mustBeAuthenticated, async (req, res) => {
    await mediaItemController.editMediaItem(req, res, logger);
});

app.delete('/api/mediaItem/:id', mustBeAuthenticated, async (req, res) => {
    await mediaItemController.deleteMediaItem(req, res, logger);
});

// UserItems

app.get('/api/userItems', mustBeAuthenticated, async (req, res) => {
    await userItemController.getUserItems(req, res, logger);
});

// Files

app.get('/api/file/:id', mustBeAuthenticated, async (req, res) => {
    await fileController.getFile(req, res);
});

app.post('/api/file', mustBeAuthenticated, (req, res) => {
    fileController.upload(req, res, logger);
});

// Users

app.get('/api/allUsers', mustBeAuthenticated, mustBeAdmin, async (req, res) => {
    await userController.getAllUsers(req, res);
});

// Parties

app.post('/api/party', mustBeAuthenticated, mustBeAdmin, async (req, res) => {
    await partyController.createParty(req, res, logger);
});

app.put('/api/party', mustBeAuthenticated, mustBeAdmin, async (req, res) => {
    await partyController.editParty(req, res, logger);
});

// User Parties

app.get('/api/userParties', mustBeAuthenticated, async (req, res) => {
    await userPartyController.getUserParties(req, res);
});

// Party items

app.delete('/api/partyItems', mustBeAuthenticated, async (req, res) => {
    await partyItemController.removeItemFromParty(req, res);
});

app.post('/api/partyItems', mustBeAuthenticated, async (req, res) => {
    await partyItemController.addItemToParty(req, res, logger);
});

app.put('/api/partyItems', mustBeAuthenticated, async (req, res) => {
    await partyItemController.updatePartyItems(req, res, logger);
});

// Party metadata

app.put('/api/partyMetadata', mustBeAuthenticated, async (req, res) => {
    await partyMetadataController.updatePartyMetadata(req, res, logger);
});

// Data from external websites

app.post('/api/linkMetadata', mustBeAuthenticated, async (req, res) => {
    await externalDataController.getLinkMetadata(req, res, logger);
});

// Route everything not caught by above routes to index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve('build/public/index.html'));
});

// Start Websockets server
socketServer.listen(parseInt(process.env.WEBSOCKETS_PORT, 10), () => {
    logger.log(
        'info',
        `Websockets server listening on port ${process.env.WEBSOCKETS_PORT}`
    );
});

// Start server
server.listen(process.env.SERVER_PORT, () => {
    logger.log('info', `App listening on port ${process.env.SERVER_PORT}`);
});
