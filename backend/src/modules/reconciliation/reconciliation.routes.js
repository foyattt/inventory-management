// backend/src/modules/reconciliation/reconciliation.routes.js

const express = require('express');
const reconciliationController = require('./reconciliation.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', reconciliationController.getReviews);
router.get('/compare/:id', reconciliationController.compareTransaction);
router.post(
  '/review/:id',
  authorize('ADMIN', 'ACCOUNTANT', 'MANAGER'),
  reconciliationController.reviewTransaction
);

module.exports = router;