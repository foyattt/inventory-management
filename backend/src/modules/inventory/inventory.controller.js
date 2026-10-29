// backend/src/modules/inventory/inventory.controller.js

const inventoryService = require('./inventory.service');
const stockSourceService = require('./stock-source.service');
const stockMovementService = require('./stock-movement.service');
const { AppError } = require('../../middleware/error.middleware');

class InventoryController {
  // ───── Products ─────
  async createProduct(req, res, next) {
    try {
      const product = await inventoryService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req, res, next) {
    try {
      const result = await inventoryService.getProducts(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await inventoryService.getProductById(req.params.id);
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await inventoryService.updateProduct(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableStock(req, res, next) {
    try {
      const stock = await inventoryService.getAvailableStock(req.params.id);
      res.status(200).json({
        success: true,
        data: stock,
      });
    } catch (error) {
      next(error);
    }
  }

  // ───── Stock Sources ─────
  async createStockSource(req, res, next) {
    try {
      const source = await stockSourceService.createStockSource(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Stock source registered successfully',
        data: source,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockSources(req, res, next) {
    try {
      const result = await stockSourceService.getStockSources(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStockSourceById(req, res, next) {
    try {
      const source = await stockSourceService.getStockSourceById(req.params.id);
      res.status(200).json({
        success: true,
        data: source,
      });
    } catch (error) {
      next(error);
    }
  }

  // ───── Stock Movements ─────
  async createAdjustment(req, res, next) {
    try {
      const { productId, stockSourceId, quantity, reason } = req.body;

      if (!productId || quantity === undefined || !reason) {
        throw new AppError('productId, quantity and reason are required', 400);
      }

      const movement = await stockMovementService.createAdjustment(
        { productId, stockSourceId, quantity, reason },
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Stock adjustment recorded successfully',
        data: movement,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req, res, next) {
    try {
      const result = await stockMovementService.getMovements(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();