import {
    TSFSPathConfig,
    TSFSRequiredEnvVars,
    TSFSValidEnvValues
} from '@steeelydan/tsfs';
import path from 'path';

export const pathConfig: TSFSPathConfig = {
    envPath: path.resolve('.env'),
    logfileDirPath: path.resolve('data'),
    publicDirPath: path.resolve('build/public')
};

export const requiredEnvVars: TSFSRequiredEnvVars = [
    'NODE_ENV',
    'SERVER_PORT',
    'WEBSOCKETS_PORT',
    'SESSION_SECRET'
];

export const validEnvValues: TSFSValidEnvValues = {};
