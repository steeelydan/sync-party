const path = require('path');

module.exports = {
    plugins: {
        tailwindcss: { config: path.resolve('src/client/tailwind.config.cjs') },
        autoprefixer: {}
    }
};
