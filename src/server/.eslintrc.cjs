const path = require('path');

module.exports = {
    root: true,
    extends: ['../../.eslintrc.common.cjs'],
    ignorePatterns: ['**/*.cjs'],
    parserOptions: {
        ecmaVersion: 2018,
        parserOptions: {
            project: path.resolve('src/server/tsconfig.json'),
            ecmaVersion: 2020
        }
    }
};
