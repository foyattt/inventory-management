// backend/src/modules/settings/settings.controller.js

const settingsService = require('./settings.service');

class SettingsController {
  async getAllSettings(req, res, next) {
    try {
      const settings = await settingsService.getAllSettings();
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  async upsertSetting(req, res, next) {
    try {
      const { key, value, description } = req.body;
      const setting = await settingsService.upsertSetting(key, value, description);
      res.status(200).json({
        success: true,
        message: 'Setting saved',
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingsController();
