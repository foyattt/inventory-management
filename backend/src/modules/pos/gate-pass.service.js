// backend/src/modules/pos/gate-pass.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { calculateLineTotal } = require('../../utils/tax.calculator');

class GatePassService {
  async createGatePassLines(tx, saleTransactionId, items, userId) {
    const createdLines = [];

    for (const item of items) {
      const { productId, quantity, unitPrice, stockSourceId } = item;

      // Validate product
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new AppError(`Product not found: ${productId}`, 404);
      }

      // Validate stock
      if (stockSourceId) {
        const source = await tx.stockSource.findUnique({ where: { id: stockSourceId } });
        if (!source) {
          throw new AppError(`Stock source not found: ${stockSourceId}`, 404);
        }
        if (Number(source.currentBalance) < Number(quantity)) {
          throw new AppError(
            `Insufficient stock in batch ${source.batchCode}. Available: ${source.currentBalance}`,
            400
          );
        }
      } else {
        // Check total available stock
        const sources = await tx.stockSource.findMany({
          where: { productId, currentBalance: { gt: 0 } },
        });
        const totalAvailable = sources.reduce((sum, s) => sum + Number(s.currentBalance), 0);
        if (totalAvailable < Number(quantity)) {
          throw new AppError(
            `Insufficient total stock for product ${product.name}. Available: ${totalAvailable}`,
            400
          );
        }
      }

      const lineSubtotal = calculateLineTotal(quantity, unitPrice);

      const line = await tx.gatePassLine.create({
        data: {
          saleTransactionId,
          productId,
          stockSourceId: stockSourceId || null,
          quantity,
          unitPrice,
          lineSubtotal,
        },
      });

      // Deduct stock
      if (stockSourceId) {
        await tx.stockSource.update({
          where: { id: stockSourceId },
          data: {
            currentBalance: { decrement: quantity },
          },
        });
      }

      // Create stock movement
      await tx.stockMovement.create({
        data: {
          productId,
          stockSourceId: stockSourceId || null,
          movementType: 'SALE',
          quantity: -Number(quantity), // negative = out
          referenceType: 'SALE_TRANSACTION',
          referenceId: saleTransactionId,
          reason: `Gate Pass sale`,
          performedById: userId,
        },
      });

      createdLines.push(line);
    }

    return createdLines;
  }
}

module.exports = new GatePassService();