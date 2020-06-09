const configureSession = (sequelize, SequelizeStore, expressSession) => {
    const sessionStore = new SequelizeStore({
        db: sequelize,
        tableName: 'sessions'
    });

    sessionStore.sync();

    const session = expressSession({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        store: sessionStore,
        cookie: {
            sameSite: true,
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            secure: process.env.NODE_ENV === 'production'
        }
    });

    return { session, sessionStore };
};

export default configureSession;
