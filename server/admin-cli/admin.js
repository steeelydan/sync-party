const Sequelize = require('sequelize');
const createModels = require('../src/database/createModels');
const {
    createUser,
    deleteUser,
    listUsers,
    deleteAllUsers,
    changePassword
} = require('../src/database/adminOperations');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../db'
});

const models = createModels(Sequelize, sequelize);

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

const runAdminCli = async () => {
    if (mode === 'create-user') {
        if (!process.argv[3] || !process.argv[4]) {
            console.log(
                'Username & password must be specified after mode arg. Exiting.'
            );
            process.exit(1);
        }
        let role = 'user';
        if (process.argv[5] === 'admin') {
            role = 'admin';
        }
        const username = process.argv[3];
        const passwordRaw = process.argv[4];
        await createUser(models, username, role, passwordRaw);
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

runAdminCli();
