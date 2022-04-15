import { Sequelize, Model, DataTypes } from 'sequelize';

class User extends Model {
    id!: string;
    username!: string;
    role!: string;
    password!: string;
    settings!: object;
    readonly createdAt!: Date;
    readonly updatedAt!: Date;
}

class Party extends Model {
    id!: string;
    owner!: string;
    name!: string;
    status!: 'active | stopped';
    members!: string[];
    items!: MediaItem[];
    readonly createdAt!: Date;
    readonly updatedAt!: Date;
}

class MediaItem extends Model {
    id!: string;
    owner!: string;
    name!: string;
    url!: string;
    type!: 'web' | 'file';
    settings!: object;
}

const createModels = (sequelize: Sequelize): any => {
    User.init(
        {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            username: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull: false
            },
            role: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull: false
            },
            settings: {
                type: DataTypes.JSON,
                defaultValue: {},
                allowNull: false
            }
        },
        {
            tableName: 'users',
            sequelize
        }
    );

    Party.init(
        {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            owner: {
                type: DataTypes.UUID,
                defaultValue: '',
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull: false
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull: false
            },
            members: {
                type: DataTypes.JSON,
                defaultValue: [],
                allowNull: false
            },
            items: {
                type: DataTypes.JSON,
                allowNull: false
            },
            metadata: {
                type: DataTypes.JSON,
                defaultValue: {},
                allowNull: false
            },
            settings: {
                type: DataTypes.JSON,
                defaultValue: {},
                allowNull: false
            }
        },
        {
            tableName: 'parties',
            sequelize
        }
    );

    MediaItem.init(
        {
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull: false
            },
            url: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                defaultValue: '',
                allowNull: false
            },
            owner: {
                type: DataTypes.UUID,
                defaultValue: '',
                allowNull: false
            },
            settings: {
                type: DataTypes.JSON,
                defaultValue: {},
                allowNull: false
            }
        },
        {
            tableName: 'media_items',
            sequelize
        }
    );

    return { User, Party, MediaItem };
};

export default createModels;
