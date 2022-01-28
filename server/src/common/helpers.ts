import path from 'path';
import winston, { Logger } from 'winston';
import { v4 as uuid } from 'uuid';

const envCheck = (logger: Logger) => {
    if (!process.env.NODE_ENV) {
        throw new Error(
            'No environment setting found. Did you configure the .env file? Options: "development", "production"'
        );
    }
    if (!['development', 'production'].includes(process.env.NODE_ENV)) {
        throw new Error(
            `Wrong environment configuration ("${process.env.NODE_ENV}"). Must be either "development" or "production".`
        );
    }
    if (!process.env.SERVER_PORT) {
        throw new Error(
            'No port setting found. Did you configure the .env file?'
        );
    }
    if (!process.env.WEBSOCKETS_PORT) {
        throw new Error(
            'No port setting for Websockets found. Did you configure the .env file?'
        );
    }
    if (!process.env.SESSION_SECRET) {
        throw new Error(
            'No session secret set. Did you configure the .env file?'
        );
    }
    if (!process.env.CLIENT_URL) {
        throw new Error(
            'Client URL not setup. Did you configure the .env file?'
        );
    }

    logger.log('info', `Environment: ${process.env.NODE_ENV}`);
};

const getFilePathFromId = (dbMediaItemId: string): string => {
    return path.join(path.resolve('uploads'), dbMediaItemId);
};

const createLogger = () => {
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            new winston.transports.File({
                filename: 'log-combined.json'
            })
        ]
    });

    if (process.env.NODE_ENV !== 'production') {
        logger.add(
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        );
    }

    logger.stream = {
        // FIXME: https://github.com/winstonjs/winston/issues/1385
        // @ts-ignore
        write: (message) => {
            logger.info(message);
        }
    };

    return logger;
};

const createWebRtcIds = (userIds: string[]) => {
    const webRtcIds: { [userId: string]: string } = {};
    userIds.forEach((userId) => {
        webRtcIds[userId] = uuid();
    });

    return webRtcIds;
};

export default {
    envCheck,
    getFilePathFromId,
    createLogger,
    createWebRtcIds
};
