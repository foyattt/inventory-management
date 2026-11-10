// backend/src/modules/pos/invoice.service.js

const { calculateLineTotal } = require('../../utils/tax.calculator');
const { toQtyString, toMoneyString } = require('../../utils/money');

class InvoiceService {
  async createInvoiceLines(tx, saleTransactionId, items) {
    const createdLines = [];

    for (const item of items) {
      const { productId, quantity, unitPrice } = item;
      const lineSubtotal = calculateLineTotal(quantity, unitPrice);

      const line = await tx.invoiceLine.create({
        data: {
          saleTransactionId,
          productId,
          quantity: toQtyString(quantity),
          unitPrice: toMoneyString(unitPrice),
          lineSubtotal,
        },
      });

      createdLines.push(line);
    }

    return createdLines;
  }
}

module.exports = new InvoiceService();
