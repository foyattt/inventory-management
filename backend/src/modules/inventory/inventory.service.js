// backend/src/modules/inventory/inventory.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { paginate } = require('../../utils/helpers');
const { qtyAdd, toQtyNumber } = require('../../utils/money');

class InventoryService {
  async createProduct(data) {
    const { internalCode, name, description, category, unitOfMeasure } = data;

    const existing = await prisma.product.findUnique({
      where: { internalCode },
    });

    if (existing) {
      throw new AppError('Product with this internal code already exists', 409);
    }

    const product = await prisma.product.create({
      data: {
        internalCode,
        name,
        description,
        category,
        unitOfMeasure: unitOfMeasure || 'PCS',
      },
    });

    return product;
  }

  async getProducts({ search, category, isActive, sourceType, page = 1, limit = 20 }) {
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { internalCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
    if (sourceType) {
      where.stockSources = { some: { sourceType } };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          stockSources: {
            select: {
              id: true,
              sourceType: true,
              currentBalance: true,
              batchCode: true,
              unitCost: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithStock = products.map((product) => {
      const importedQty = product.stockSources
        .filter((s) => s.sourceType === 'IMPORTED')
        .reduce((sum, s) => qtyAdd(sum, s.currentBalance), '0.0000');

      const localQty = product.stockSources
        .filter((s) => s.sourceType === 'LOCAL')
        .reduce((sum, s) => qtyAdd(sum, s.currentBalance), '0.0000');

      const totalQty = qtyAdd(importedQty, localQty);
      const primaryCost = product.stockSources.find((s) => s.unitCost != null)?.unitCost || null;

      return {
        ...product,
        stockSummary: {
          imported: toQtyNumber(importedQty),
          local: toQtyNumber(localQty),
          total: toQtyNumber(totalQty),
        },
        primaryUnitCost: primaryCost,
      };
    });

    return {
      data: productsWithStock,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0,
      },
    };
  }

  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockSources: {
          orderBy: { receiptDate: 'desc' },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const importedQty = product.stockSources
      .filter((s) => s.sourceType === 'IMPORTED')
      .reduce((sum, s) => qtyAdd(sum, s.currentBalance), '0.0000');

    const localQty = product.stockSources
      .filter((s) => s.sourceType === 'LOCAL')
      .reduce((sum, s) => qtyAdd(sum, s.currentBalance), '0.0000');

    return {
      ...product,
      stockSummary: {
        imported: toQtyNumber(importedQty),
        local: toQtyNumber(localQty),
        total: toQtyNumber(qtyAdd(importedQty, localQty)),
      },
    };
  }

  async updateProduct(id, data) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        unitOfMeasure: data.unitOfMeasure,
        isActive: data.isActive,
      },
    });

    return updated;
  }

  async getAvailableStock(productId) {
    const sources = await prisma.stockSource.findMany({
      where: {
        productId,
        currentBalance: { gt: 0 },
      },
      orderBy: { receiptDate: 'asc' },
    });

    const imported = sources
      .filter((s) => s.sourceType === 'IMPORTED')
      .reduce((sum, s) => qtyAdd(sum, s.currentBalance), '0.0000');

    const local = sources
      .filter((s) => s.sourceType === 'LOCAL')
      .reduce((sum, s) => qtyAdd(sum, s.currentBalance), '0.0000');

    return {
      productId,
      imported: toQtyNumber(imported),
      local: toQtyNumber(local),
      total: toQtyNumber(qtyAdd(imported, local)),
      sources,
    };
  }
}

module.exports = new InventoryService();
