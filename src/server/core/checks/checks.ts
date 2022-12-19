import fs from 'fs';
import {
    TSFSPathConfig,
    TSFSRequiredEnvVars,
    TSFSValidEnvValues
} from '../../../shared/types.js';
import { checkIfPathExistsAndIsAbsolute } from '../helpers.js';

const checkPathConfig = (tsfsPathConfig: TSFSPathConfig): void => {
    for (let i = 0; i < Object.keys(tsfsPathConfig).length; i++) {
        const key = Object.keys(tsfsPathConfig)[i];
        const value = tsfsPathConfig[key as keyof TSFSPathConfig];
        checkIfPathExistsAndIsAbsolute(value, key);
    }
};

export const checkConfigFiles = (tsfsPathConfig: TSFSPathConfig): void => {
    checkPathConfig(tsfsPathConfig);

    if (!tsfsPathConfig.envPath) {
        throw new Error('.env path has to be configured.');
    }

    const okay = fs.existsSync(tsfsPathConfig.envPath);

    if (!okay) {
        throw new Error('You have to create a .env file.\n');
    }
};

export const checkPublicDir = (tsfsPathConfig: TSFSPathConfig): void => {
    checkIfPathExistsAndIsAbsolute(tsfsPathConfig.publicDirPath, 'Public Dir');

    if (
        tsfsPathConfig.publicDirPath &&
        !fs.existsSync(tsfsPathConfig.publicDirPath)
    ) {
        throw new Error(
            'Public directory does not exist. Did you forget to build the client?'
        );
    }
};

export const checkEnv = (
    requiredEnvVars: TSFSRequiredEnvVars | undefined,
    validEnvValues: TSFSValidEnvValues | undefined
): void => {
    if (!requiredEnvVars || !validEnvValues) {
        throw new Error(
            'Required environment vars & valid environment values have to be configured.'
        );
    }

    requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
            throw new Error('Env var not set: ' + envVar);
        }
    });

    Object.keys(validEnvValues).forEach((variable) => {
        const validEnvValue = validEnvValues[variable];
        const envValue = process.env[variable];

        if (!envValue) {
            throw new Error(
                'Variable from validEnvValues does not exist in your .env'
            );
        } else {
            if (Array.isArray(validEnvValue)) {
                if (!validEnvValue.includes(envValue)) {
                    throw new Error(
                        'Env var has wrong value: ' +
                            variable +
                            '; must be on of: ' +
                            validEnvValue.join(', ')
                    );
                }
            } else if (typeof validEnvValue === 'function') {
                if (!validEnvValue(envValue)) {
                    throw new Error(
                        'Env var has wrong value: ' + variable + '.'
                    );
                }
            }
        }
    });
};
