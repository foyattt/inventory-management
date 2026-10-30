// backend/src/modules/settings/settings.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');

class SettingsService {
  async getSetting(key) {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    return setting;
  }

  async getAllSettings() {
    return prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async upsertSetting(key, value, description = null) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  async getTaxRate() {
    const setting = await this.getSetting('tax_rate');
    return setting ? Number(setting.value) : 15;
  }
}

module.exports = new SettingsService();