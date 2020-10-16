import rateLimit from 'express-rate-limit';

const rateLimiters = {
    authRateLimiter: rateLimit({
        windowMs: 60 * 1000,
        max: 20
    }),
    indexRateLimiter: rateLimit({
        windowMs: 60 * 1000,
        max: 60
    })
};

export default rateLimiters;
