// backend/src/modules/reports/reports.routes.js

const express = require('express');
const reportsController = require('./reports.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', reportsController.getDashboard);

module.exports = router;