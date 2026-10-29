// backend/src/modules/inventory/stock-movement.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');

class StockMovementService {
  async createAdjustment({ productId, stockSourceId, quantity, reason }, userId) {
    if (quantity === 0) {
      throw new AppError('Adjustment quantity cannot be zero', 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (stockSourceId) {
      const source = await prisma.stockSource.findUnique({ where: { id: stockSourceId } });
      if (!source) {
        throw new AppError('Stock source not found', 404);
      }

      // Prevent negative balance
      const newBalance = Number(source.currentBalance) + Number(quantity);
      if (newBalance < 0) {
        throw new AppError('Insufficient stock in this batch for the adjustment', 400);
      }
    }

    const movement = await prisma.$transaction(async (tx) => {
      const createdMovement = await tx.stockMovement.create({
        data: {
          productId,
          stockSourceId: stockSourceId || null,
          movementType: 'ADJUSTMENT',
          quantity,
          referenceType: 'MANUAL_ADJUSTMENT',
          reason,
          performedById: userId,
        },
      });

      if (stockSourceId) {
        await tx.stockSource.update({
          where: { id: stockSourceId },
          data: {
            currentBalance: {
              increment: quantity,
            },
          },
        });
      }

      return createdMovement;
    });

    return movement;
  }

  async getMovements({ productId, stockSourceId, movementType, page = 1, limit = 30 }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (productId) where.productId = productId;
    if (stockSourceId) where.stockSourceId = stockSourceId;
    if (movementType) where.movementType = movementType;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: { id: true, internalCode: true, name: true },
          },
          stockSource: {
            select: { id: true, batchCode: true, sourceType: true },
          },
          performedBy: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return {
      data: movements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new StockMovementService();