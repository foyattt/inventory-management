// backend/src/modules/auth/auth.routes.js

const express = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authRateLimiter } = require('../../middleware/rate-limit.middleware');

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getProfile);

// Example of role-protected route (optional)
// router.post('/register', authenticate, authorize('ADMIN'), authController.register);

module.exports = router;