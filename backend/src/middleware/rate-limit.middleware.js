// backend/src/middleware/rate-limit.middleware.js

const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

module.exports = {
  authRateLimiter,
};
