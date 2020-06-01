const rateLimit = require('express-rate-limit');

const rateLimiters = {
    authRateLimiter: rateLimit({
        windowMs: 60 * 1000,
        max: 20
    })
};

module.exports = rateLimiters;
