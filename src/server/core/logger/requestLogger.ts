import morgan from 'morgan';
import { Express } from 'express';
import { TSFSLogger } from '../../../shared/types.js';

export const setup = (generalLogger: TSFSLogger, app: Express): void => {
    const requestLogger = morgan(
        // @ts-ignore
        ':remote-addr - :remote-user :method :url HTTP/:http-version :status :res[content-length] :referrer :user-agent - :response-time ms',
        { stream: generalLogger.stream }
    );

    app.use(requestLogger);
};
