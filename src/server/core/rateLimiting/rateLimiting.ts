import rateLimit from 'express-rate-limit';

import type { RateLimitRequestHandler } from 'express-rate-limit';

export const createRateLimiter = (
    hitsPerMinute: number
): RateLimitRequestHandler => {
    return rateLimit({
        windowMs: 60 * 1000,
        max: hitsPerMinute
    });
};
