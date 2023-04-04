import { DataTypes, Model } from 'sequelize';
import type { IUser, UserRole } from '../../shared/types.js';
import type {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Sequelize
} from 'sequelize';

export class User
    extends Model<InferAttributes<User>, InferCreationAttributes<User>>
    implements IUser
{
    declare id: CreationOptional<string>;
    declare username: string;
    declare role: UserRole;
    declare password: string;
    declare settings: Record<string, never>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export const initUser = (sequelize: Sequelize) => {
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
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        {
            tableName: 'users',
            sequelize
        }
    );
};
