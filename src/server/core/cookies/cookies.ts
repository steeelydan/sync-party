import cookieParser from 'cookie-parser';

import type { Express } from 'express';

export const setupCookies = (app: Express): void => {
    app.use(cookieParser(process.env.SESSION_SECRET));
};
