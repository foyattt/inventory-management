// backend/src/modules/pos/pos.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { calculateTotals } = require('../../utils/tax.calculator');
const gatePassService = require('./gate-pass.service');
const invoiceService = require('./invoice.service');
const depositService = require('./deposit.service');

class PosService {
  async createTransaction(data, userId) {
    const {
      gatePassNo,
      fsNo,
      customerId,
      paymentMethod,
      gatePassItems = [],
      invoiceItems = [],
      depositAllocations = [],
      notes,
    } = data;

    // Basic validation
    if (!gatePassNo || !fsNo) {
      throw new AppError('Gate Pass No and FS No are required', 400);
    }
    if (!customerId) {
      throw new AppError('Customer is required', 400);
    }
    if (!['CASH', 'CREDIT'].includes(paymentMethod)) {
      throw new AppError('Payment method must be CASH or CREDIT', 400);
    }
    if (gatePassItems.length === 0) {
      throw new AppError('At least one Gate Pass item is required', 400);
    }

    // Check unique document numbers
    const existingGP = await prisma.saleTransaction.findUnique({ where: { gatePassNo } });
    if (existingGP) {
      throw new AppError('Gate Pass No already exists', 409);
    }

    const existingFS = await prisma.saleTransaction.findUnique({ where: { fsNo } });
    if (existingFS) {
      throw new AppError('FS No already exists', 409);
    }

    // Check customer
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Calculate totals
    const gatePassTotals = calculateTotals(gatePassItems);
    const invoiceTotals = calculateTotals(invoiceItems);

    // Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Sale Transaction
      const saleTransaction = await tx.saleTransaction.create({
        data: {
          gatePassNo,
          fsNo,
          customerId,
          paymentMethod,
          status: 'COMPLETED',
          gatePassSubtotal: gatePassTotals.subtotal,
          gatePassTaxAmount: gatePassTotals.taxAmount,
          gatePassTotal: gatePassTotals.total,
          invoiceSubtotal: invoiceTotals.subtotal,
          invoiceTaxAmount: invoiceTotals.taxAmount,
          invoiceTotal: invoiceTotals.total,
          taxRate: gatePassTotals.taxRate,
          notes,
          createdById: userId,
        },
      });

      // 2. Create Gate Pass lines + deduct stock
      await gatePassService.createGatePassLines(
        tx,
        saleTransaction.id,
        gatePassItems,
        userId
      );

      // 3. Create Invoice lines (no stock effect)
      if (invoiceItems.length > 0) {
        await invoiceService.createInvoiceLines(tx, saleTransaction.id, invoiceItems);
      }

      // 4. Handle payment
      if (paymentMethod === 'CASH') {
        await depositService.createDepositAllocations(
          tx,
          saleTransaction.id,
          depositAllocations,
          gatePassTotals.total
        );
      }

      if (paymentMethod === 'CREDIT') {
        // Create credit ledger entry
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (customer.creditPeriodDays || 30));

        await tx.creditLedger.create({
          data: {
            customerId,
            saleTransactionId: saleTransaction.id,
            debitAmount: gatePassTotals.total,
            dueDate,
            status: 'WITHIN_LIMIT',
          },
        });
      }

      // Return full transaction
      return tx.saleTransaction.findUnique({
        where: { id: saleTransaction.id },
        include: {
          customer: true,
          gatePassLines: { include: { product: true } },
          invoiceLines: { include: { product: true } },
          depositAllocations: true,
          creditLedgers: true,
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });
    });

    return result;
  }

  async getTransactionById(id) {
    const transaction = await prisma.saleTransaction.findUnique({
      where: { id },
      include: {
        customer: true,
        gatePassLines: { include: { product: true, stockSource: true } },
        invoiceLines: { include: { product: true } },
        depositAllocations: true,
        creditLedgers: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  async getTransactions({ page = 1, limit = 20, customerId, paymentMethod }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (customerId) where.customerId = customerId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const [data, total] = await Promise.all([
      prisma.saleTransaction.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          createdBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.saleTransaction.count({ where }),
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

module.exports = new PosService();