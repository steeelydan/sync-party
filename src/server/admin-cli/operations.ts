import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../../shared/types.js';
import { User } from '../models/User.js';

const createUser = (username: string, role: UserRole, passwordRaw: string) => {
    const user: IUser = {} as IUser;

    bcrypt.hash(passwordRaw, 10, (error, passwordHashed) => {
        user.username = username;
        user.password = passwordHashed;
        user.role = role;
        user.settings = {};

        User.findOne({ where: { username: user.username } }).then(
            async (previousUser: User | null) => {
                if (!previousUser) {
                    const newUser = await User.create(user);

                    console.log('User created');
                    console.log(newUser.dataValues, 'Your new user');
                } else {
                    console.log('User already exists.');
                }
            }
        );
    });
};

const deleteUser = async (username: string) => {
    try {
        const user = await User.findOne({ where: { username } });

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

const listUsers = async () => {
    const allUsers = await User.findAll();

    if (allUsers.length === 0) {
        return Promise.reject(new Error('No users found'));
    } else {
        return allUsers;
    }
};

const deleteAllUsers = async () => {
    await User.destroy({ where: {}, truncate: true });

    console.log('All users deleted.');
};

const changePassword = async (username: string, newPasswordRaw: string) => {
    const user = await User.findOne({ where: { username } });
    if (!user) {
        throw new Error(`User ${username} does not exist!`);
    }
    const newPasswordHashed = await bcrypt.hash(newPasswordRaw, 10);
    user.password = newPasswordHashed;
    await User.update({ password: newPasswordHashed }, { where: { username } });
};

export { createUser, deleteUser, listUsers, deleteAllUsers, changePassword };
