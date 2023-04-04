import dotenv from 'dotenv';
import {
    checkConfigFiles,
    checkEnv,
    checkPublicDir
} from '../checks/checks.js';

import type {
    PathConfig,
    RequiredEnvVars,
    ValidEnvValues
} from '../../../shared/types.js';

export const setupEnvironment = (
    pathConfig: PathConfig,
    requiredEnvVars: RequiredEnvVars,
    validEnvValues: ValidEnvValues,
    doCheckConfigFiles = true,
    doCheckEnv = true,
    doCheckPublicDir = true
): void => {
    dotenv.config({ path: pathConfig.envPath });

    if (doCheckConfigFiles) {
        checkConfigFiles(pathConfig);
    }

    if (doCheckEnv) {
        checkEnv(requiredEnvVars, validEnvValues);
    }

    if (doCheckPublicDir) {
        checkPublicDir(pathConfig);
    }
};
