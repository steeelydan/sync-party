import createModels from '../database/createModels.js';
import { DbConfig, UserRole } from '../../shared/types.js';
import {
    createUser,
    deleteUser,
    listUsers,
    deleteAllUsers,
    changePassword
} from './operations.js';
import { setupEnvironment } from '../core/environment/environment.js';
import { createDatabase } from '../core/database/database.js';
import dbConfig from '../dbConfig.cjs';
import { pathConfig, requiredEnvVars, validEnvValues } from '../constants.js';

const runAdminCli = async () => {
    setupEnvironment(pathConfig, requiredEnvVars, validEnvValues);

    const sequelize = await createDatabase(dbConfig as DbConfig);

    const models = createModels(sequelize);

    const mode = process.argv[2].trim();
    if (
        [
            'create-user',
            'delete-user',
            'list-users',
            'delete-all-users',
            'change-password'
        ].includes(mode) === false
    ) {
        console.log(mode);
        console.log('Not a valid mode.');
        process.exit(1);
    }

    if (mode === 'create-user') {
        if (!process.argv[3] || !process.argv[4]) {
            console.log(
                'Username & password must be specified after mode arg. Exiting.'
            );
            process.exit(1);
        }
        let role: UserRole = 'user';
        if (process.argv[5] === 'admin') {
            role = 'admin';
        }
        const username = process.argv[3];
        const passwordRaw = process.argv[4];
        createUser(models, username, role, passwordRaw);
    }

    if (mode === 'delete-user') {
        if (!process.argv[3]) {
            console.log('Specify username');

            return;
        }
        const username = process.argv[3];
        await deleteUser(models, username);
        console.log(`User ${username} deleted.`);
    }

    if (mode === 'list-users') {
        const allUsers = await listUsers(models);
        console.log(JSON.stringify(allUsers, null, 4));
    }

    if (mode === 'delete-all-users') {
        await deleteAllUsers(models);
        console.log('All users deleted.');
    }

    if (mode === 'change-password') {
        if (!process.argv[3] || !process.argv[4]) {
            console.log(
                'Username & new password must be specified after mode arg. Exiting.'
            );
            process.exit(1);
        }
        const username = process.argv[3];
        const newPasswordRaw = process.argv[4];
        await changePassword(models, username, newPasswordRaw);
    }
};

runAdminCli().catch((err) => {
    console.log(err);
});
