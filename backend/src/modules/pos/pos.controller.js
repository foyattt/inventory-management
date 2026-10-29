// backend/src/modules/pos/pos.controller.js

const posService = require('./pos.service');

class PosController {
  async createTransaction(req, res, next) {
    try {
      const transaction = await posService.createTransaction(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      const transaction = await posService.getTransactionById(req.params.id);
      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const result = await posService.getTransactions(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PosController();