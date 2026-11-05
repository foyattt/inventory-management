// backend/src/modules/reconciliation/reconciliation.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { d, toMoneyString, toQtyString, moneyEquals } = require('../../utils/money');
const { paginate } = require('../../utils/helpers');

class ReconciliationService {
  async compareTransaction(saleTransactionId) {
    const transaction = await prisma.saleTransaction.findUnique({
      where: { id: saleTransactionId },
      include: {
        gatePassLines: { include: { product: true } },
        invoiceLines: { include: { product: true } },
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    const differences = {
      missingInInvoice: [],
      missingInGatePass: [],
      quantityMismatches: [],
      priceMismatches: [],
      totals: {
        gatePassSubtotal: toMoneyString(transaction.gatePassSubtotal),
        invoiceSubtotal: toMoneyString(transaction.invoiceSubtotal),
        gatePassTax: toMoneyString(transaction.gatePassTaxAmount),
        invoiceTax: toMoneyString(transaction.invoiceTaxAmount),
        gatePassTotal: toMoneyString(transaction.gatePassTotal),
        invoiceTotal: toMoneyString(transaction.invoiceTotal),
        subtotalDiff: d(transaction.gatePassSubtotal).minus(d(transaction.invoiceSubtotal)).toFixed(2),
        taxDiff: d(transaction.gatePassTaxAmount).minus(d(transaction.invoiceTaxAmount)).toFixed(2),
        totalDiff: d(transaction.gatePassTotal).minus(d(transaction.invoiceTotal)).toFixed(2),
      },
    };

    const gpMap = new Map();
    transaction.gatePassLines.forEach((line) => {
      gpMap.set(line.productId, line);
    });

    const invMap = new Map();
    transaction.invoiceLines.forEach((line) => {
      invMap.set(line.productId, line);
    });

    // Check Gate Pass items
    for (const [productId, gpLine] of gpMap) {
      const invLine = invMap.get(productId);
      if (!invLine) {
        differences.missingInInvoice.push({
          productId,
          productName: gpLine.product.name,
          quantity: toQtyString(gpLine.quantity),
          unitPrice: toMoneyString(gpLine.unitPrice),
        });
      } else {
        if (!d(gpLine.quantity).eq(d(invLine.quantity))) {
          differences.quantityMismatches.push({
            productId,
            productName: gpLine.product.name,
            gatePassQty: toQtyString(gpLine.quantity),
            invoiceQty: toQtyString(invLine.quantity),
            difference: d(gpLine.quantity).minus(d(invLine.quantity)).toFixed(4),
          });
        }
        if (!moneyEquals(gpLine.unitPrice, invLine.unitPrice)) {
          differences.priceMismatches.push({
            productId,
            productName: gpLine.product.name,
            gatePassPrice: toMoneyString(gpLine.unitPrice),
            invoicePrice: toMoneyString(invLine.unitPrice),
          });
        }
      }
    }

    // Check Invoice items missing in Gate Pass
    for (const [productId, invLine] of invMap) {
      if (!gpMap.has(productId)) {
        differences.missingInGatePass.push({
          productId,
          productName: invLine.product.name,
          quantity: toQtyString(invLine.quantity),
          unitPrice: toMoneyString(invLine.unitPrice),
        });
      }
    }

    // Determine status
    let status = 'MATCHED';
    if (differences.missingInInvoice.length || differences.missingInGatePass.length) {
      status = differences.missingInInvoice.length ? 'MISSING_FROM_INVOICE' : 'MISSING_FROM_GATE_PASS';
    } else if (differences.quantityMismatches.length) {
      status = 'QUANTITY_MISMATCH';
    } else if (differences.priceMismatches.length) {
      status = 'PRICE_MISMATCH';
    } else if (!moneyEquals(differences.totals.totalDiff, '0')) {
      status = 'TAX_OR_TOTAL_MISMATCH';
    }

    return { status, differences };
  }

  async createOrUpdateReview(saleTransactionId, notes, userId) {
    const comparison = await this.compareTransaction(saleTransactionId);

    const review = await prisma.reconciliationReview.upsert({
      where: { saleTransactionId }, // Note: you may need a unique constraint
      update: {
        status: comparison.status,
        differencesSnapshot: comparison.differences,
        notes,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
      create: {
        saleTransactionId,
        status: comparison.status,
        differencesSnapshot: comparison.differences,
        notes,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
    });

    return review;
  }

  async getReviews({ page = 1, limit = 20, status }) {
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);
    const where = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.reconciliationReview.findMany({
        where,
        include: {
          saleTransaction: {
            select: {
              id: true,
              gatePassNo: true,
              fsNo: true,
              transactionDate: true,
              customer: { select: { name: true } },
            },
          },
          reviewedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.reconciliationReview.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0,
      },
    };
  }
}

module.exports = new ReconciliationService();