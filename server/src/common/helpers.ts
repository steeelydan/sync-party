import path from 'path';
import winston, { Logger } from 'winston';
import crypto from 'crypto';

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
    if (!process.env.URL) {
        throw new Error(
            'URL is not set. Did you configure the .env file? You need to configure a home url for redirection to a https route when user visits a http route'
        );
    }
    if (!process.env.SESSION_SECRET) {
        throw new Error(
            'No session secret set. Did you configure the .env file?'
        );
    }
    if (!process.env.PORT) {
        throw new Error(
            'No port setting found. Did you configure the .env file?'
        );
    }
    if (!process.env.USE_SSL) {
        throw new Error(
            'SSL use setting not found. Did you configure the .env file? Options: "true", "false"'
        );
    }
    if (
        process.env.USE_SSL &&
        !['true', 'false'].includes(process.env.USE_SSL)
    ) {
        throw new Error(
            `Wrong USE_SSL configuration ("${process.env.NODE_ENV}"). Must be either "true" or "false".`
        );
    }
    if (
        process.env.USE_SSL === 'true' &&
        (!process.env.SSL_CHAIN_PATH ||
            !process.env.SSL_CERT_PATH ||
            !process.env.SSL_KEY_PATH)
    ) {
        throw new Error(
            `Wrong SSL paths configuration ("${process.env.NODE_ENV}"). All three options must be set: SSL_CHAIN_PATH, SSL_CERT_PATH, SSL_KEY_PATH.`
        );
    }

    logger.log('info', `Environment: ${process.env.NODE_ENV}`);
};

const getFilePathFromId = (dbMediaItemId: string): string => {
    return path.resolve(path.join(__dirname, '/../../uploads/', dbMediaItemId));
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

const createPartyToken = () => {
    return crypto.randomBytes(16).toString('hex');
};

const createUserToken = () => {
    return crypto.randomBytes(64).toString('base64');
};

export default {
    envCheck,
    getFilePathFromId,
    createLogger,
    createPartyToken,
    createUserToken
};
