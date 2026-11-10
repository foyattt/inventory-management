// backend/src/modules/pos/gate-pass.service.js

const { AppError } = require('../../middleware/error.middleware');
const { calculateLineTotal } = require('../../utils/tax.calculator');
const { toQtyString, toMoneyString, toQty, d } = require('../../utils/money');
const { decrementStockBalance } = require('../../utils/atomic-balance');

class GatePassService {
  async deductFifo(tx, productId, quantity) {
    let remaining = toQty(quantity);

    const sources = await tx.$queryRaw`
      SELECT "id", "batchCode", "currentBalance"
      FROM "stock_sources"
      WHERE "productId" = ${productId}
        AND "currentBalance" > 0
      ORDER BY "receiptDate" ASC, "createdAt" ASC
      FOR UPDATE
    `;

    const deducted = [];

    for (const source of sources) {
      if (remaining.lte(0)) break;
      const available = toQty(source.currentBalance);
      const take = available.lt(remaining) ? available : remaining;
      await decrementStockBalance(tx, source.id, take);
      deducted.push({ stockSourceId: source.id, quantity: toQtyString(take) });
      remaining = remaining.minus(take);
    }

    if (remaining.gt(0)) {
      throw new AppError(
        `Insufficient total stock for this product. Short by ${toQtyString(remaining)}`,
        400
      );
    }

    return deducted;
  }

  async createGatePassLines(tx, saleTransactionId, items, userId) {
    const createdLines = [];

    for (const item of items) {
      const { productId, quantity, unitPrice, stockSourceId } = item;
      const qty = toQtyString(quantity);
      const price = toMoneyString(unitPrice);

      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new AppError(`Product not found: ${productId}`, 404);
      }

      let deductedSources = [];

      if (stockSourceId) {
        const source = await tx.$queryRaw`
          SELECT "id", "batchCode", "currentBalance"
          FROM "stock_sources"
          WHERE "id" = ${stockSourceId}
          FOR UPDATE
        `;
        if (!source.length) {
          throw new AppError(`Stock source not found: ${stockSourceId}`, 404);
        }
        await decrementStockBalance(tx, stockSourceId, quantity);
        deductedSources = [{ stockSourceId, quantity: qty }];
      } else {
        deductedSources = await this.deductFifo(tx, productId, quantity);
      }

      const lineSubtotal = calculateLineTotal(quantity, unitPrice);

      const line = await tx.gatePassLine.create({
        data: {
          saleTransactionId,
          productId,
          stockSourceId: stockSourceId || null,
          quantity: qty,
          unitPrice: price,
          lineSubtotal,
        },
      });

      for (const deducted of deductedSources) {
        await tx.stockMovement.create({
          data: {
            productId,
            stockSourceId: deducted.stockSourceId,
            movementType: 'SALE',
            quantity: toQtyString(d(deducted.quantity).neg()),
            referenceType: 'SALE_TRANSACTION',
            referenceId: saleTransactionId,
            reason: 'Gate Pass sale',
            performedById: userId,
          },
        });
      }

      createdLines.push(line);
    }

    return createdLines;
  }
}

module.exports = new GatePassService();
