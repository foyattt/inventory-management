// backend/src/modules/settings/settings.routes.js

const express = require('express');
const settingsController = require('./settings.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER'), settingsController.getAllSettings);
router.post('/', authorize('ADMIN'), settingsController.upsertSetting);

module.exports = router;