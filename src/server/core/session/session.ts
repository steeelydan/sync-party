import expressSession from 'express-session';
import connectSessionSequelize from 'connect-session-sequelize';

import type { Express, RequestHandler } from 'express';
import type { Sequelize } from 'sequelize';

export const setupSession = (
    app: Express,
    sequelize: Sequelize,
    sessionMaxAge: number
): { sessionMiddleware: RequestHandler } => {
    const SequelizeStore = connectSessionSequelize(expressSession.Store);

    const sessionStore = new SequelizeStore({ db: sequelize });

    sessionStore.sync();

    if (!process.env.SESSION_SECRET) {
        throw new Error(
            'Error initializing session middleware: No session secret set in .env'
        );
    }

    const sessionMiddleware = expressSession({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        store: sessionStore,
        proxy: process.env.NODE_ENV === 'production',
        cookie: {
            sameSite: true,
            httpOnly: true,
            maxAge: sessionMaxAge,
            secure: process.env.NODE_ENV === 'test' ? false : true
        }
    });

    app.use(sessionMiddleware);

    return { sessionMiddleware };
};
