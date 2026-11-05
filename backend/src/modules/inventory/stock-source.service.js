// backend/src/modules/inventory/stock-source.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { paginate } = require('../../utils/helpers');
const { toQtyString, toMoneyString } = require('../../utils/money');

class StockSourceService {
  async createStockSource(data, userId) {
    const { productId, sourceType, batchCode, supplierRef, receiptDate, receivedQty, unitCost, notes } = data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const existing = await prisma.stockSource.findUnique({
      where: {
        productId_batchCode: {
          productId,
          batchCode,
        },
      },
    });

    if (existing) {
      throw new AppError('A stock source with this batch code already exists for this product', 409);
    }

    const qty = toQtyString(receivedQty);
    const cost = unitCost === undefined || unitCost === null || unitCost === '' ? null : toMoneyString(unitCost);

    const stockSource = await prisma.$transaction(async (tx) => {
      const source = await tx.stockSource.create({
        data: {
          productId,
          sourceType,
          batchCode,
          supplierRef,
          receiptDate: new Date(receiptDate),
          receivedQty: qty,
          currentBalance: qty,
          unitCost: cost,
          notes,
        },
        include: {
          product: {
            select: { id: true, internalCode: true, name: true },
          },
        },
      });

      await tx.stockMovement.create({
        data: {
          productId,
          stockSourceId: source.id,
          movementType: 'RECEIPT',
          quantity: qty,
          referenceType: 'STOCK_SOURCE',
          referenceId: source.id,
          reason: `Initial receipt - Batch ${batchCode}`,
          performedById: userId,
        },
      });

      return source;
    });

    return stockSource;
  }

  async getStockSources({ productId, sourceType, page = 1, limit = 20 }) {
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const where = {};
    if (productId) where.productId = productId;
    if (sourceType) where.sourceType = sourceType;

    const [sources, total] = await Promise.all([
      prisma.stockSource.findMany({
        where,
        include: {
          product: {
            select: { id: true, internalCode: true, name: true },
          },
        },
        orderBy: { receiptDate: 'desc' },
        skip,
        take,
      }),
      prisma.stockSource.count({ where }),
    ]);

    return {
      data: sources,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0,
      },
    };
  }

  async getStockSourceById(id) {
    const source = await prisma.stockSource.findUnique({
      where: { id },
      include: {
        product: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!source) {
      throw new AppError('Stock source not found', 404);
    }

    return source;
  }
}

module.exports = new StockSourceService();
