// backend/src/modules/inventory/inventory.routes.js

const express = require('express');
const inventoryController = require('./inventory.controller');
const { authenticate } = require('../auth/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

const router = express.Router();

// All inventory routes require authentication
router.use(authenticate);

// ───── Products ─────
router.post(
  '/products',
  authorize('ADMIN', 'INVENTORY_STAFF', 'MANAGER'),
  inventoryController.createProduct
);

router.get('/products', inventoryController.getProducts);
router.get('/products/:id', inventoryController.getProductById);

router.patch(
  '/products/:id',
  authorize('ADMIN', 'INVENTORY_STAFF', 'MANAGER'),
  inventoryController.updateProduct
);

router.get('/products/:id/stock', inventoryController.getAvailableStock);

// ───── Stock Sources (Batches) ─────
router.post(
  '/stock-sources',
  authorize('ADMIN', 'INVENTORY_STAFF', 'MANAGER'),
  inventoryController.createStockSource
);

router.get('/stock-sources', inventoryController.getStockSources);
router.get('/stock-sources/:id', inventoryController.getStockSourceById);

// ───── Stock Movements / Adjustments ─────
router.post(
  '/adjustments',
  authorize('ADMIN', 'INVENTORY_STAFF', 'MANAGER'),
  inventoryController.createAdjustment
);

router.get('/movements', inventoryController.getMovements);

module.exports = router;