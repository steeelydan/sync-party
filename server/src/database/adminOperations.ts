const bcrypt = require('bcryptjs');

const createUser = async (models, username, role, passwordRaw) => {
    const user = {};

    bcrypt.hash(passwordRaw, 10, (error, passwordHashed) => {
        user.username = username;
        user.password = passwordHashed;
        user.role = role;

        models.User.findOne({ where: { username: user.username } }).then(
            async (previousUser) => {
                if (!previousUser) {
                    const newUser = await models.User.create(user);

                    console.log('User created');
                    console.log(newUser.dataValues, 'Your new user');
                } else {
                    console.log('User already exists.');
                }
            }
        );
    });
};

const deleteUser = async (models, username) => {
    await models.User.findOne({ where: { username: username } }).then(
        (user) => {
            if (!user) {
                console.log(
                    `No user found with username: ${username}. Exiting`
                );
                return;
            }

            user.destroy();
            console.log(`User deleted: ${username} (id: ${user.id})`);
        }
    );
};

const listUsers = async (models) => {
    const allUsers = await models.User.findAll();

    if (allUsers.length === 0) {
        return Promise.reject(new Error('No users found'));
    } else {
        return allUsers;
    }
};

const deleteAllUsers = async (models) => {
    await models.User.destroy({ where: {}, truncate: true });

    console.log('All users deleted.');
};

const changePassword = async (models, username, newPasswordRaw) => {
    const user = await models.User.findOne({ where: { username: username } });
    if (!user) {
        throw new Error(`User ${username} does not exist!`);
    }
    const newPasswordHashed = await bcrypt.hash(newPasswordRaw, 10);
    user.password = newPasswordHashed;
    await models.User.update(
        { password: newPasswordHashed },
        { where: { username: username } }
    );
};

export default { createUser, deleteUser, listUsers, deleteAllUsers, changePassword };
