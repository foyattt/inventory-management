// backend/src/modules/reconciliation/reconciliation.controller.js

const reconciliationService = require('./reconciliation.service');

class ReconciliationController {
  async compareTransaction(req, res, next) {
    try {
      const result = await reconciliationService.compareTransaction(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async reviewTransaction(req, res, next) {
    try {
      const review = await reconciliationService.createOrUpdateReview(
        req.params.id,
        req.body.notes,
        req.user.id
      );
      res.status(200).json({
        success: true,
        message: 'Reconciliation review saved',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req, res, next) {
    try {
      const result = await reconciliationService.getReviews(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReconciliationController();