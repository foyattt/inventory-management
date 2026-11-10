// backend/src/modules/credit/credit.routes.js

const express = require('express');
const creditController = require('./credit.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

// Credit ledger overview
router.get('/', creditController.getCreditOverview);

// Payments list (all, or filter by customerId)
router.get('/payments', creditController.getPayments);

// Record payment
router.post(
  '/payments',
  authorize('ADMIN', 'ACCOUNTANT', 'MANAGER'),
  creditController.recordPayment
);

// Customer credit summary
router.get('/summary/:customerId', creditController.getCustomerCreditSummary);

module.exports = router;