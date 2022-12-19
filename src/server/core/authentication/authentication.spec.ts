import path from 'path';
import express, { Express } from 'express';
import { Sequelize } from 'sequelize';
import supertest from 'supertest';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { mustBeAdmin, mustBeAuthenticated } from './middleware.js';
import { setupRequestParsers } from '../requestParsers/requestParsers.js';
import { CoreTestModels, initializeCoreTestModels } from '../testModels.js';
import { setupCookies } from '../cookies/cookies.js';
import { setupSession } from '../session/session.js';
import { setupAuthentication } from './setup.js';
import {
    TSFSDbConfig,
    TSFSRequestUser,
    TSFSUserRole
} from '../../../shared/types.js';
import { getTestDatabase } from '../testHelpers.js';

let sequelize: Sequelize, models: CoreTestModels;

const getTestExpressApp = (models: CoreTestModels): Express => {
    const app = express();
    setupRequestParsers(app);
    setupCookies(app);
    setupSession(app, sequelize, 3000);
    setupAuthentication(app, models.CoreTestUser);

    return app;
};

const dbConfig: TSFSDbConfig = {
    test: {
        logging: false,
        storage: path.resolve('data/db-test.sqlite3'),
        dialect: 'sqlite'
    }
};

beforeAll(async (): Promise<void> => {
    sequelize = await getTestDatabase(dbConfig);
    models = await initializeCoreTestModels(sequelize);
    process.env.SESSION_SECRET = 'abc';

    const adminUser = {
        username: 'adminuser',
        role: 'admin' as TSFSUserRole,
        password: bcrypt.hashSync('123')
    };
    await models.CoreTestUser.create(adminUser);
    const nonAdminUser = {
        username: 'nonadminuser',
        role: 'user' as TSFSUserRole,
        password: bcrypt.hashSync('cba')
    };
    await models.CoreTestUser.create(nonAdminUser);
});

describe('Authenticate user', () => {
    it('does not authenticate user with wrong password', async () => {
        const app = getTestExpressApp(models);

        app.post('/login', passport.authenticate('local'), (req, res) => {
            res.send("We won't ever see this");
        });

        const response = await supertest(app)
            .post('/login')
            .send({ username: 'adminuser', password: '1234' });

        expect(response.statusCode).toBe(401);
    });

    it('does not authenticate user if user is not found', async () => {
        const app = getTestExpressApp(models);
        let requestUser;

        app.post('/login', passport.authenticate('local'), (req, res) => {
            requestUser = req.user;
            res.send("We won't ever see this");
        });

        const response = await supertest(app)
            .post('/login')
            .send({ username: 'nouser', password: '123' });

        expect(response.statusCode).toBe(401);
        expect(requestUser).toBe(undefined);
    });

    it('authenticates user with correct password', async () => {
        const app = getTestExpressApp(models);

        app.post('/login', passport.authenticate('local'), (req, res) => {
            res.send('Congratulations');
        });

        const response = await supertest(app)
            .post('/login')
            .send({ username: 'adminuser', password: '123' });

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Congratulations');
    });

    it('does not authenticate if cookie is wrong', async () => {
        const app = getTestExpressApp(models);

        app.get('/', mustBeAuthenticated, (req, res) => {
            res.send('User');
        });

        app.post('/login', passport.authenticate('local'), (req, res) => {
            res.send('Congratulations');
        });

        const loginResponse = await supertest(app)
            .post('/login')
            .send({ username: 'adminuser', password: '123' });
        expect(loginResponse.statusCode).toBe(200);
        const validCookie =
            loginResponse.headers['set-cookie'][0].split(';')[0];

        const response = await supertest(app)
            .get('/')
            .set('Cookie', validCookie + 'wrong');

        expect(response.statusCode).toBe(403);
    });

    it('puts a valid user object onto the request', async () => {
        const app = getTestExpressApp(models);

        let requestUser: TSFSRequestUser | undefined;

        app.get('/', mustBeAuthenticated, (req, res) => {
            requestUser = req.user;
            res.send('User');
        });

        app.post('/login', passport.authenticate('local'), (req, res) => {
            res.send('Congratulations');
        });

        const loginResponse = await supertest(app)
            .post('/login')
            .send({ username: 'adminuser', password: '123' });
        expect(loginResponse.statusCode).toBe(200);
        const validCookie =
            loginResponse.headers['set-cookie'][0].split(';')[0];

        const response = await supertest(app)
            .get('/')
            .set('Cookie', validCookie);

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('User');
        expect(requestUser?.username).toBe('adminuser');
        expect(requestUser?.role).toBe('admin');
    });
});

describe('Consider user roles', () => {
    it('logs in non-admin user', async () => {
        const app = getTestExpressApp(models);

        let requestUser: TSFSRequestUser | undefined;

        app.post('/login', passport.authenticate('local'), (req, res) => {
            requestUser = req.user;
            res.send('Congratulations');
        });

        const loginResponse = await supertest(app)
            .post('/login')
            .send({ username: 'nonadminuser', password: 'cba' });
        expect(loginResponse.statusCode).toBe(200);

        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.text).toBe('Congratulations');
        expect(requestUser?.role).toBe('user');
    });

    it('puts non-admin user onto request', async () => {
        const app = getTestExpressApp(models);

        let requestUser: TSFSRequestUser | undefined;

        app.get('/', mustBeAuthenticated, (req, res) => {
            requestUser = req.user;
            res.send('User');
        });

        app.post('/login', passport.authenticate('local'), (req, res) => {
            res.send('Congratulations');
        });

        const loginResponse = await supertest(app)
            .post('/login')
            .send({ username: 'nonadminuser', password: 'cba' });
        expect(loginResponse.statusCode).toBe(200);
        const validCookie =
            loginResponse.headers['set-cookie'][0].split(';')[0];

        const response = await supertest(app)
            .get('/')
            .set('Cookie', validCookie);

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('User');
        expect(requestUser?.username).toBe('nonadminuser');
        expect(requestUser?.role).toBe('user');
    });

    it('prevents non-admin user from visiting admin route', async () => {
        const app = getTestExpressApp(models);

        let requestUser: TSFSRequestUser | undefined;

        app.get('/', mustBeAuthenticated, mustBeAdmin, (req, res) => {
            requestUser = req.user;
            res.send("We won't be here...");
        });

        app.post('/login', passport.authenticate('local'), (req, res) => {
            res.send('Congratulations');
        });

        const loginResponse = await supertest(app)
            .post('/login')
            .send({ username: 'nonadminuser', password: 'cba' });
        expect(loginResponse.statusCode).toBe(200);
        const validCookie =
            loginResponse.headers['set-cookie'][0].split(';')[0];

        const response = await supertest(app)
            .get('/')
            .set('Cookie', validCookie);

        expect(response.statusCode).toBe(403);
        expect(requestUser).toBe(undefined);
    });

    it('does not let a regular user access admin endpoints if authentication middleware is missing', async () => {
        const app = getTestExpressApp(models);

        let requestUser: TSFSRequestUser | undefined;

        app.get('/', mustBeAdmin, (req, res) => {
            requestUser = req.user;
            res.send("We won't be here...");
        });

        app.post('/login', passport.authenticate('local'), (req, res) => {
            res.send('Congratulations');
        });

        const loginResponse = await supertest(app)
            .post('/login')
            .send({ username: 'nonadminuser', password: 'cba' });
        expect(loginResponse.statusCode).toBe(200);
        const validCookie =
            loginResponse.headers['set-cookie'][0].split(';')[0];

        const response = await supertest(app)
            .get('/')
            .set('Cookie', validCookie);

        expect(response.statusCode).toBe(403);
        expect(requestUser).toBe(undefined);
    });

    it('lets admin user access admin endpoints', async () => {
        const app = getTestExpressApp(models);

        let requestUser: TSFSRequestUser | undefined;

        app.get('/', mustBeAdmin, (req, res) => {
            requestUser = req.user;
            res.send("We won't be here...");
        });

        app.post('/login', passport.authenticate('local'), (req, res) => {
            res.send('Congratulations');
        });

        const loginResponse = await supertest(app)
            .post('/login')
            .send({ username: 'adminuser', password: '123' });
        expect(loginResponse.statusCode).toBe(200);
        const validCookie =
            loginResponse.headers['set-cookie'][0].split(';')[0];

        const response = await supertest(app)
            .get('/')
            .set('Cookie', validCookie);

        expect(response.statusCode).toBe(200);
        expect(requestUser?.role).toBe('admin');
        expect(requestUser?.username).toBe('adminuser');
    });
});
