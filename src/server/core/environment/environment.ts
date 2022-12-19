import dotenv from 'dotenv';
import {
    TSFSPathConfig,
    TSFSRequiredEnvVars,
    TSFSValidEnvValues
} from '../../../shared/types.js';
import {
    checkConfigFiles,
    checkEnv,
    checkPublicDir
} from '../checks/checks.js';

export const setupEnvironment = (
    tsfsPathConfig: TSFSPathConfig,
    requiredEnvVars: TSFSRequiredEnvVars,
    validEnvValues: TSFSValidEnvValues,
    doCheckConfigFiles = true,
    doCheckEnv = true,
    doCheckPublicDir = true
): void => {
    dotenv.config({ path: tsfsPathConfig.envPath });

    if (doCheckConfigFiles) {
        checkConfigFiles(tsfsPathConfig);
    }

    if (doCheckEnv) {
        checkEnv(requiredEnvVars, validEnvValues);
    }

    if (doCheckPublicDir) {
        checkPublicDir(tsfsPathConfig);
    }
};
