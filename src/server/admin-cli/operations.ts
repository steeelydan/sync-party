import bcrypt from 'bcryptjs';
import { AppUser, Models, NewUser, UserRole } from '../../shared/types';

const createUser = (
    models: Models,
    username: string,
    role: UserRole,
    passwordRaw: string
) => {
    const user: NewUser = {} as NewUser;

    bcrypt.hash(passwordRaw, 10, (error, passwordHashed) => {
        user.username = username;
        user.password = passwordHashed;
        user.role = role;

        models.User.findOne({ where: { username: user.username } }).then(
            async (previousUser: AppUser) => {
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

const deleteUser = async (models: Models, username: string) => {
    try {
        const user = await models.User.findOne({ where: { username } });

        if (!user) {
            console.log(`No user found with username: ${username}. Exiting`);

            return;
        }

        user.destroy();
        console.log(`User deleted: ${username} (id: ${user.id})`);
    } catch (error) {
        console.log(error);
    }
};

const listUsers = async (models: Models) => {
    const allUsers = await models.User.findAll();

    if (allUsers.length === 0) {
        return Promise.reject(new Error('No users found'));
    } else {
        return allUsers;
    }
};

const deleteAllUsers = async (models: Models) => {
    await models.User.destroy({ where: {}, truncate: true });

    console.log('All users deleted.');
};

const changePassword = async (
    models: Models,
    username: string,
    newPasswordRaw: string
) => {
    const user = await models.User.findOne({ where: { username } });
    if (!user) {
        throw new Error(`User ${username} does not exist!`);
    }
    const newPasswordHashed = await bcrypt.hash(newPasswordRaw, 10);
    user.password = newPasswordHashed;
    await models.User.update(
        { password: newPasswordHashed },
        { where: { username } }
    );
};

export { createUser, deleteUser, listUsers, deleteAllUsers, changePassword };
