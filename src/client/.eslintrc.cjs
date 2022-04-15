const path = require('path');

module.exports = {
    root: true,
    extends: ['../../.eslintrc.common.cjs', 'plugin:react-hooks/recommended'],
    root: true,
    ignorePatterns: [
        'tailwind.config.cjs',
        'postcss.config.cjs',
        'webpack.config.js'
    ],
    env: {
        browser: true
    },
    parserOptions: {
        project: [path.resolve('src/client/tsconfig.json')],
        ecmaVersion: 2020
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    rules: {
        'react-hooks/exhaustive-deps': 'error'
    }
};
