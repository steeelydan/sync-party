import { DataTypes, Model } from 'sequelize';
import type { IParty, PartyStatus } from '../../shared/types.js';
import type {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Sequelize
} from 'sequelize';

export class Party
    extends Model<InferAttributes<Party>, InferCreationAttributes<Party>>
    implements IParty
{
    declare id: CreationOptional<string>;
    declare owner: string;
    declare name: string;
    declare status: PartyStatus;
    declare members: string[];
    declare items: string[];
    declare metadata: {
        played?: { [mediaItemId: string]: boolean } | undefined;
    };
    declare settings: { webRtcIds: Record<string, string> };
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export const initParty = (sequelize: Sequelize) => {
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
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        {
            tableName: 'parties',
            sequelize
        }
    );
};
