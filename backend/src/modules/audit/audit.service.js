// backend/src/modules/audit/audit.service.js

const prisma = require('../../prisma/client');

class AuditService {
  async log({
    actorId = null,
    action,
    entityType,
    entityId = null,
    oldValues = null,
    newValues = null,
    reason = null,
    ipAddress = null,
    userAgent = null,
  }) {
    try {
      await prisma.auditEvent.create({
        data: {
          actorId,
          action,
          entityType,
          entityId,
          oldValues,
          newValues,
          reason,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      // Never break the main request because of audit failure
      console.error('Audit log failed:', error.message);
    }
  }

  async getLogs({ page = 1, limit = 50, entityType, actorId }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (entityType) where.entityType = entityType;
    if (actorId) where.actorId = actorId;

    const [data, total] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        include: {
          actor: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.auditEvent.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new AuditService();