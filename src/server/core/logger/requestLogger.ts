import morgan from 'morgan';

import type { Express } from 'express';
import type { Logger } from 'winston';

export const setup = (generalLogger: Logger, app: Express): void => {
    const requestLogger = morgan(
        // @ts-ignore
        ':remote-addr - :remote-user :method :url HTTP/:http-version :status :res[content-length] :referrer :user-agent - :response-time ms',
        { stream: generalLogger.stream }
    );

    app.use(requestLogger);
};
