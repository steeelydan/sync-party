const createModels = (Sequelize, sequelizeInstance) => {
    const models = {
        User: sequelizeInstance.define('user', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            username: {
                type: Sequelize.STRING,
                defaultValue: '',
                allowNull: false
            },
            role: {
                type: Sequelize.STRING,
                defaultValue: '',
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                defaultValue: '',
                allowNull: false
            },
            settings: {
                type: Sequelize.JSON,
                defaultValue: {},
                allowNull: false
            }
        }),
        Party: sequelizeInstance.define('party', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            owner: {
                type: Sequelize.UUID,
                defaultValue: '',
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                defaultValue: '',
                allowNull: false
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: '',
                allowNull: false
            },
            members: {
                type: Sequelize.JSON,
                defaultValue: [],
                allowNull: false
            },
            items: {
                type: Sequelize.JSON,
                allowNull: false
            },
            metadata: {
                type: Sequelize.JSON,
                defaultValue: {},
                allowNull: false
            },
            settings: {
                type: Sequelize.JSON,
                defaultValue: {},
                allowNull: false
            }
        }),
        MediaItem: sequelizeInstance.define('media_item', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                defaultValue: '',
                allowNull: false
            },
            url: {
                type: Sequelize.STRING,
                defaultValue: '',
                allowNull: false
            },
            type: {
                type: Sequelize.STRING,
                defaultValue: '',
                allowNull: false
            },
            owner: {
                type: Sequelize.UUID,
                defaultValue: '',
                allowNull: false
            },
            settings: {
                type: Sequelize.JSON,
                defaultValue: {},
                allowNull: false
            }
        })
    };

    return models;
};

module.exports = (Sequelize, sequelizeInstance) => {
    return createModels(Sequelize, sequelizeInstance);
};
