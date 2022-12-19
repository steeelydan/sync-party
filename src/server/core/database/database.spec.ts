import path from 'path';
import { Sequelize } from 'sequelize';
import { TSFSDbConfig } from '../../../shared/types.js';
import { getTestDatabase } from '../testHelpers.js';
import { CoreTestModels, initializeCoreTestModels } from '../testModels.js';
import { createDatabase } from './database.js';

let sequelize: Sequelize;
let models: CoreTestModels;

const dbConfig: TSFSDbConfig = {
    test: {
        logging: false,
        storage: path.resolve('data/db-test.sqlite3'),
        dialect: 'sqlite'
    }
};

describe('setup database', () => {
    it('throws if no process.env.NODE_ENV specified', async () => {
        process.env.NODE_ENV = undefined;
        try {
            await createDatabase(dbConfig);
            fail();
        } catch (e) {}
    });

    it('creates sequelize and model instances', async () => {
        sequelize = await getTestDatabase(dbConfig);
        models = await initializeCoreTestModels(sequelize);

        expect(sequelize).toBeTruthy();
        expect(sequelize.getDialect()).toBe('sqlite');
        expect(models.CoreTestUser).toBeTruthy();
    });
});
