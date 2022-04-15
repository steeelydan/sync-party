const path = require('path');

module.exports = {
    content: [path.resolve('src/client/src') + '/**/*.{ts,tsx}'],
    theme: {
        extend: {}
    },
    plugins: []
};
