import { Express } from 'express';
import cookieParser from 'cookie-parser';

export const setupCookies = (app: Express): void => {
    app.use(cookieParser(process.env.SESSION_SECRET));
};
