import fs from 'fs';
import { checkIfPathExistsAndIsAbsolute } from '../helpers.js';

import type {
    PathConfig,
    RequiredEnvVars,
    ValidEnvValues
} from '../../../shared/types.js';

const checkPathConfig = (pathConfig: PathConfig): void => {
    for (let i = 0; i < Object.keys(pathConfig).length; i++) {
        const key = Object.keys(pathConfig)[i];
        const value = pathConfig[key as keyof PathConfig];
        checkIfPathExistsAndIsAbsolute(value, key);
    }
};

export const checkConfigFiles = (pathConfig: PathConfig): void => {
    checkPathConfig(pathConfig);

    if (!pathConfig.envPath) {
        throw new Error('.env path has to be configured.');
    }

    const okay = fs.existsSync(pathConfig.envPath);

    if (!okay) {
        throw new Error('You have to create a .env file.\n');
    }
};

export const checkPublicDir = (pathConfig: PathConfig): void => {
    checkIfPathExistsAndIsAbsolute(pathConfig.publicDirPath, 'Public Dir');

    if (pathConfig.publicDirPath && !fs.existsSync(pathConfig.publicDirPath)) {
        throw new Error(
            'Public directory does not exist. Did you forget to build the client?'
        );
    }
};

export const checkEnv = (
    requiredEnvVars: RequiredEnvVars | undefined,
    validEnvValues: ValidEnvValues | undefined
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
