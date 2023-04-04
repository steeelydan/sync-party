import path from 'path';

import type {
    PathConfig,
    RequiredEnvVars,
    ValidEnvValues
} from '../shared/types.js';

export const pathConfig: PathConfig = {
    envPath: path.resolve('.env'),
    logfileDirPath: path.resolve('data'),
    publicDirPath: path.resolve('build/public')
};

export const requiredEnvVars: RequiredEnvVars = [
    'NODE_ENV',
    'SERVER_PORT',
    'WEBSOCKETS_PORT',
    'SESSION_SECRET'
];

export const validEnvValues: ValidEnvValues = {};
