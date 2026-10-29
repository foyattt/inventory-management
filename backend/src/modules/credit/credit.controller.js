// backend/src/modules/credit/credit.controller.js

const creditService = require('./credit.service');

class CreditController {
  async getCreditOverview(req, res, next) {
    try {
      const result = await creditService.getCreditOverview(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req, res, next) {
    try {
      const payment = await creditService.recordPayment(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerCreditSummary(req, res, next) {
    try {
      const summary = await creditService.getCustomerCreditSummary(req.params.customerId);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CreditController();