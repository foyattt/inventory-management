// backend/src/modules/inventory/inventory.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');

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

  async getProducts({ search, category, isActive, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { internalCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

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
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate total available stock per product
    const productsWithStock = products.map((product) => {
      const importedQty = product.stockSources
        .filter((s) => s.sourceType === 'IMPORTED')
        .reduce((sum, s) => sum + Number(s.currentBalance), 0);

      const localQty = product.stockSources
        .filter((s) => s.sourceType === 'LOCAL')
        .reduce((sum, s) => sum + Number(s.currentBalance), 0);

      return {
        ...product,
        stockSummary: {
          imported: importedQty,
          local: localQty,
          total: importedQty + localQty,
        },
      };
    });

    return {
      data: productsWithStock,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
      .reduce((sum, s) => sum + Number(s.currentBalance), 0);

    const localQty = product.stockSources
      .filter((s) => s.sourceType === 'LOCAL')
      .reduce((sum, s) => sum + Number(s.currentBalance), 0);

    return {
      ...product,
      stockSummary: {
        imported: importedQty,
        local: localQty,
        total: importedQty + localQty,
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
      orderBy: { receiptDate: 'asc' }, // FIFO
    });

    const imported = sources
      .filter((s) => s.sourceType === 'IMPORTED')
      .reduce((sum, s) => sum + Number(s.currentBalance), 0);

    const local = sources
      .filter((s) => s.sourceType === 'LOCAL')
      .reduce((sum, s) => sum + Number(s.currentBalance), 0);

    return {
      productId,
      imported,
      local,
      total: imported + local,
      sources,
    };
  }
}

module.exports = new InventoryService();