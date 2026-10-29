// backend/src/modules/customers/customers.routes.js

const express = require('express');
const customersController = require('./customers.controller');
const { authenticate } = require('../auth/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'ACCOUNTANT', 'MANAGER'), customersController.createCustomer);
router.get('/', customersController.getCustomers);
router.get('/:id', customersController.getCustomerById);
router.patch('/:id', authorize('ADMIN', 'ACCOUNTANT', 'MANAGER'), customersController.updateCustomer);

module.exports = router;