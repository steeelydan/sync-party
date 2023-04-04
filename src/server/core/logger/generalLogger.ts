import path from 'path';
import winston from 'winston';

import type { Logger } from 'winston';
import type { PathConfig } from '../../../shared/types.js';

export const createGeneralLogger = (pathConfig: PathConfig): Logger => {
    if (!pathConfig.logfileDirPath) {
        throw new Error('Logfile dir has to be configured');
    }

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            new winston.transports.File({
                filename: path.join(
                    pathConfig.logfileDirPath,
                    'log-combined.json'
                )
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
        write: (message): void => {
            logger.info(message);
        }
    };

    return logger;
};
