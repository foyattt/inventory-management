// backend/src/modules/credit/credit.routes.js

const express = require('express');
const creditController = require('./credit.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', creditController.getCreditOverview);
router.post('/payments', authorize('ADMIN', 'ACCOUNTANT', 'MANAGER'), creditController.recordPayment);
router.get('/summary/:customerId', creditController.getCustomerCreditSummary);

module.exports = router;