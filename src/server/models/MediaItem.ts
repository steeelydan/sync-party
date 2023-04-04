import { DataTypes, Model } from 'sequelize';
import type { IMediaItem, MediaItemType } from '../../shared/types.js';
import type {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
    Sequelize
} from 'sequelize';

export class MediaItem
    extends Model<
        InferAttributes<MediaItem>,
        InferCreationAttributes<MediaItem>
    >
    implements IMediaItem
{
    declare id: CreationOptional<string>;
    declare owner: string;
    declare name: string;
    declare url: string;
    declare type: MediaItemType;
    declare settings: Record<string, never>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export const initMediaItem = (sequelize: Sequelize) => {
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
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        {
            tableName: 'media_items',
            sequelize
        }
    );
};
