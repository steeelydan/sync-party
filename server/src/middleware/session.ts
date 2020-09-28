import { Sequelize } from 'sequelize';
import { SessionOptions } from 'express-session';
import { RequestHandler } from 'express';

const configureSession = (
    sequelize: Sequelize,
    SequelizeStore: any,
    expressSession: (options?: SessionOptions) => RequestHandler
) => {
    const sessionStore = new SequelizeStore({
        db: sequelize,
        tableName: 'sessions'
    });

    sessionStore.sync();

    const session = expressSession({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        store: sessionStore,
        proxy: process.env.USE_PROXY === 'true',
        cookie: {
            sameSite: true,
            httpOnly: true,
            maxAge: 28 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production'
        }
    });

    return { session, sessionStore };
};

export default configureSession;
