// backend/src/modules/reports/reports.controller.js

const reportsService = require('./reports.service');

class ReportsController {
  async getDashboard(req, res, next) {
    try {
      const data = await reportsService.getDashboard();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportsController();