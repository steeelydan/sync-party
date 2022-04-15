const path = require('path');

module.exports = {
    development: {
        dialect: 'sqlite',
        logging: false,
        storage: path.resolve('data/db-dev')
    },
    production: {
        dialect: 'sqlite',
        logging: false,
        storage: path.resolve('data/db')
    }
};
