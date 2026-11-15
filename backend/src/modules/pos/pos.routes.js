// backend/src/modules/pos/pos.routes.js

const express = require('express');
const posController = require('./pos.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get(
  '/next-numbers',
  authorize('ADMIN', 'ACCOUNTANT', 'MANAGER'),
  posController.getNextNumbers
);

router.post(
  '/transactions',
  authorize('ADMIN', 'ACCOUNTANT', 'MANAGER'),
  posController.createTransaction
);

router.get('/transactions', posController.getTransactions);
router.get('/transactions/:id', posController.getTransactionById);

module.exports = router;