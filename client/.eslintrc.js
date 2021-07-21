module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    plugins: ['react'],
    extends: [
        'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
        // 'prettier',
        // 'plugin:prettier/recommended' // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
            jsx: true // Allows for the parsing of JSX
        }
    },
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        'no-use-before-define': 'off',
        'no-warning-comments': 'warn',
        '@typescript-eslint/no-use-before-define': ['off'],
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/ban-types': 'warn',
        'no-console': 'warn'
    },
    settings: {
        react: {
            version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
        }
    }
};
