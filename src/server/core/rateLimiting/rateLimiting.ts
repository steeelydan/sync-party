import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

export const createRateLimiter = (
    hitsPerMinute: number
): RateLimitRequestHandler => {
    return rateLimit({
        windowMs: 60 * 1000,
        max: hitsPerMinute
    });
};
