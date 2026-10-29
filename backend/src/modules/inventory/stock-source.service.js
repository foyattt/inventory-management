// backend/src/modules/inventory/stock-source.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');

class StockSourceService {
  async createStockSource(data, userId) {
    const { productId, sourceType, batchCode, supplierRef, receiptDate, receivedQty, unitCost, notes } = data;

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check for duplicate batch
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

    const stockSource = await prisma.$transaction(async (tx) => {
      const source = await tx.stockSource.create({
        data: {
          productId,
          sourceType,
          batchCode,
          supplierRef,
          receiptDate: new Date(receiptDate),
          receivedQty,
          currentBalance: receivedQty,
          unitCost,
          notes,
        },
        include: {
          product: {
            select: { id: true, internalCode: true, name: true },
          },
        },
      });

      // Create stock movement (RECEIPT)
      await tx.stockMovement.create({
        data: {
          productId,
          stockSourceId: source.id,
          movementType: 'RECEIPT',
          quantity: receivedQty,
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
    const skip = (page - 1) * limit;

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
        take: limit,
      }),
      prisma.stockSource.count({ where }),
    ]);

    return {
      data: sources,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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