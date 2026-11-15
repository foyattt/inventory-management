// backend/src/modules/inventory/stock-movement.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { paginate } = require('../../utils/helpers');
const { toQtyString, d } = require('../../utils/money');
const { decrementStockBalance, incrementStockBalance } = require('../../utils/atomic-balance');

class StockMovementService {
  async createAdjustment({ productId, stockSourceId, quantity, reason }, userId) {
    if (d(quantity).eq(0)) {
      throw new AppError('Adjustment quantity cannot be zero', 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const qty = toQtyString(quantity);

    const movement = await prisma.$transaction(async (tx) => {
      let resolvedSourceId = stockSourceId || null;

      if (!resolvedSourceId) {
        // Auto-pick first source with balance (FIFO) for negative, or any source / create for positive
        const sources = await tx.stockSource.findMany({
          where: { productId },
          orderBy: { receiptDate: 'asc' },
        });
        if (d(quantity).lt(0)) {
          const withBalance = sources.find((s) => d(s.currentBalance).gt(0));
          if (!withBalance) {
            throw new AppError('No stock source with available balance to decrease', 400);
          }
          resolvedSourceId = withBalance.id;
        } else if (sources.length > 0) {
          resolvedSourceId = sources[0].id;
        } else {
          // Create a local adjustment batch when none exists
          const created = await tx.stockSource.create({
            data: {
              productId,
              sourceType: 'LOCAL',
              batchCode: `ADJ-${Date.now()}`,
              receiptDate: new Date(),
              receivedQty: '0',
              currentBalance: '0',
              unitCost: null,
              notes: 'Auto-created for adjustment',
            },
          });
          resolvedSourceId = created.id;
        }
      }

      const source = await tx.$queryRaw`
        SELECT "id", "currentBalance"
        FROM "stock_sources"
        WHERE "id" = ${resolvedSourceId}
        FOR UPDATE
      `;
      if (!source.length) {
        throw new AppError('Stock source not found', 404);
      }

      if (d(quantity).lt(0)) {
        await decrementStockBalance(tx, resolvedSourceId, d(quantity).abs());
      } else {
        await incrementStockBalance(tx, resolvedSourceId, quantity);
      }

      return tx.stockMovement.create({
        data: {
          productId,
          stockSourceId: resolvedSourceId,
          movementType: 'ADJUSTMENT',
          quantity: qty,
          referenceType: 'MANUAL_ADJUSTMENT',
          reason,
          performedById: userId,
        },
      });
    });

    return movement;
  }

  async getMovements({ productId, stockSourceId, movementType, page = 1, limit = 30 }) {
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

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
        take,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return {
      data: movements,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0,
      },
    };
  }
}

module.exports = new StockMovementService();