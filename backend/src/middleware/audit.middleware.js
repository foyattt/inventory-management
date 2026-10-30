// backend/src/middleware/audit.middleware.js

const auditService = require('../modules/audit/audit.service');

const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (res.statusCode < 400 && req.user) {
        auditService.log({
          actorId: req.user.id,
          action,
          entityType,
          entityId: body?.data?.id || req.params?.id || null,
          newValues: ['CREATE', 'UPDATE', 'DELETE'].includes(action) ? body?.data : null,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = {
  auditLog,
};