import { Sequelize } from 'sequelize';
import { TSFSDbConfig } from '../../shared/types.js';
import { createDatabase } from './database/database.js';

export const getTestDatabase = async (
    dbConfig: TSFSDbConfig
): Promise<Sequelize> => {
    process.env.NODE_ENV = 'test';

    const db = await createDatabase(dbConfig);

    return db;
};
