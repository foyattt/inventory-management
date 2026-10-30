// backend/src/modules/users/users.routes.js

const express = require('express');
const usersController = require('./users.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER'), usersController.getUsers);
router.get('/:id', authorize('ADMIN', 'MANAGER'), usersController.getUserById);
router.patch('/:id', authorize('ADMIN'), usersController.updateUser);
router.post('/change-password', usersController.changePassword);

module.exports = router;