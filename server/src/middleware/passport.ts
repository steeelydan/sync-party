import passport from 'passport';
import * as PassportLocal from 'passport-local';
const LocalStrategy = PassportLocal.Strategy;
import bcrypt from 'bcryptjs';
import { Logger } from 'winston';

const configurePassport = (models: Models, logger: Logger) => {
    /* The verify result is passed to the done function.
You have to make sure the return values are what passport expects.
Apart from that the implementation is up to you.
username & password params should be called exactly that.
Otherwise you must define a custom field mapping, see below. */
    const verifyCallback = async (
        username: string,
        password: string,
        done: (err: any, user?: Express.User | false) => void
    ) => {
        try {
            const user = await models.User.findOne({
                where: {
                    username
                }
            });

            if (!user) {
                logger.log(
                    'info',
                    `Failed login attempt: Non existent user: ${username}`
                );

                return done(null, false);
            }

            const isValid = await bcrypt.compare(password, user.password);

            if (isValid) {
                logger.log(
                    'info',
                    `Successful login by user: ${username} (${user.id})`
                );

                return done(null, user);
            } else {
                logger.log(
                    'info',
                    `Failed login attempt: Wrong password for username: ${username}`
                );

                return done(null, false);
            }
        } catch (error) {
            return done(error);
        }
    };

    const strategy = new LocalStrategy(verifyCallback);

    passport.use(strategy);

    // Attach a user property with the user id as value to req.passport
    passport.serializeUser((user: AuthenticatedPassportUser, done) => {
        done(null, user.id);
    });

    // Attach req.user object
    passport.deserializeUser(async (userId, done) => {
        try {
            const user = await models.User.findOne({
                where: {
                    id: userId
                }
            });

            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    return passport;
};

export { configurePassport };
