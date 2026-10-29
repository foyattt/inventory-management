// backend/src/modules/auth/auth.routes.js

const express = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('./auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register); // You can protect this later with ADMIN only
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getProfile);

// Example of role-protected route (optional)
// router.post('/register', authenticate, authorize('ADMIN'), authController.register);

module.exports = router;