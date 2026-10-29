// backend/src/modules/reconciliation/reconciliation.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');

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
        gatePassSubtotal: Number(transaction.gatePassSubtotal),
        invoiceSubtotal: Number(transaction.invoiceSubtotal),
        gatePassTax: Number(transaction.gatePassTaxAmount),
        invoiceTax: Number(transaction.invoiceTaxAmount),
        gatePassTotal: Number(transaction.gatePassTotal),
        invoiceTotal: Number(transaction.invoiceTotal),
        subtotalDiff: Number(transaction.gatePassSubtotal) - Number(transaction.invoiceSubtotal),
        taxDiff: Number(transaction.gatePassTaxAmount) - Number(transaction.invoiceTaxAmount),
        totalDiff: Number(transaction.gatePassTotal) - Number(transaction.invoiceTotal),
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
          quantity: Number(gpLine.quantity),
          unitPrice: Number(gpLine.unitPrice),
        });
      } else {
        if (Number(gpLine.quantity) !== Number(invLine.quantity)) {
          differences.quantityMismatches.push({
            productId,
            productName: gpLine.product.name,
            gatePassQty: Number(gpLine.quantity),
            invoiceQty: Number(invLine.quantity),
            difference: Number(gpLine.quantity) - Number(invLine.quantity),
          });
        }
        if (Number(gpLine.unitPrice) !== Number(invLine.unitPrice)) {
          differences.priceMismatches.push({
            productId,
            productName: gpLine.product.name,
            gatePassPrice: Number(gpLine.unitPrice),
            invoicePrice: Number(invLine.unitPrice),
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
          quantity: Number(invLine.quantity),
          unitPrice: Number(invLine.unitPrice),
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
    } else if (Math.abs(differences.totals.totalDiff) > 0.01) {
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
    const skip = (page - 1) * limit;
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
        take: Number(limit),
      }),
      prisma.reconciliationReview.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new ReconciliationService();