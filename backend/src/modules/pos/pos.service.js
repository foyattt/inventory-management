// backend/src/modules/pos/pos.service.js

const prisma = require('../../prisma/client');
const { Prisma } = require('@prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { calculateTotals } = require('../../utils/tax.calculator');
const { paginate } = require('../../utils/helpers');
const { toMoneyString } = require('../../utils/money');
const gatePassService = require('./gate-pass.service');
const invoiceService = require('./invoice.service');
const depositService = require('./deposit.service');
const settingsService = require('../settings/settings.service');

class PosService {
  /**
   * Returns the next Gate Pass No and FS No.
   * Uses SystemSetting counters (gate_pass_seq / fs_seq).
   * After initialization, numbers auto-increment.
   */
  async getNextNumbers() {
    const pad = (n, width = 6) => String(n).padStart(width, '0');

    return prisma.$transaction(async (tx) => {
      let gpSetting = await tx.systemSetting.findUnique({
        where: { key: 'gate_pass_seq' },
      });
      let nextGp = 1;
      if (gpSetting) {
        nextGp = parseInt(gpSetting.value, 10) + 1;
        if (Number.isNaN(nextGp) || nextGp < 1) nextGp = 1;
        await tx.systemSetting.update({
          where: { key: 'gate_pass_seq' },
          data: { value: String(nextGp) },
        });
      } else {
        const last = await tx.saleTransaction.findFirst({
          orderBy: { createdAt: 'desc' },
          select: { gatePassNo: true },
        });
        if (last?.gatePassNo) {
          const match = String(last.gatePassNo).match(/(\d+)$/);
          if (match) nextGp = parseInt(match[1], 10) + 1;
        }
        await tx.systemSetting.create({
          data: {
            key: 'gate_pass_seq',
            value: String(nextGp),
            description: 'Last used Gate Pass sequence number',
          },
        });
      }

      let fsSetting = await tx.systemSetting.findUnique({
        where: { key: 'fs_seq' },
      });
      let nextFs = 1;
      if (fsSetting) {
        nextFs = parseInt(fsSetting.value, 10) + 1;
        if (Number.isNaN(nextFs) || nextFs < 1) nextFs = 1;
        await tx.systemSetting.update({
          where: { key: 'fs_seq' },
          data: { value: String(nextFs) },
        });
      } else {
        const last = await tx.saleTransaction.findFirst({
          orderBy: { createdAt: 'desc' },
          select: { fsNo: true },
        });
        if (last?.fsNo) {
          const match = String(last.fsNo).match(/(\d+)$/);
          if (match) nextFs = parseInt(match[1], 10) + 1;
        }
        await tx.systemSetting.create({
          data: {
            key: 'fs_seq',
            value: String(nextFs),
            description: 'Last used FS sequence number',
          },
        });
      }

      return {
        gatePassNo: `GP-${pad(nextGp)}`,
        fsNo: `FS-${pad(nextFs)}`,
      };
    });
  }

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

    const existingGP = await prisma.saleTransaction.findUnique({
      where: { gatePassNo },
    });
    if (existingGP) {
      throw new AppError('Gate Pass No already exists', 409);
    }

    const existingFS = await prisma.saleTransaction.findUnique({
      where: { fsNo },
    });
    if (existingFS) {
      throw new AppError('FS No already exists', 409);
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const taxRate = await settingsService.getTaxRate();
    const gatePassTotals = calculateTotals(gatePassItems, taxRate);
    const invoiceTotals = calculateTotals(invoiceItems, taxRate);

    const result = await prisma.$transaction(
      async (tx) => {
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
            taxRate: toMoneyString(taxRate),
            notes,
            createdById: userId,
          },
        });

        await gatePassService.createGatePassLines(
          tx,
          saleTransaction.id,
          gatePassItems,
          userId
        );

        if (invoiceItems.length > 0) {
          await invoiceService.createInvoiceLines(
            tx,
            saleTransaction.id,
            invoiceItems
          );
        }

        if (paymentMethod === 'CASH') {
          await depositService.createDepositAllocations(
            tx,
            saleTransaction.id,
            depositAllocations,
            gatePassTotals.total
          );
        }

        if (paymentMethod === 'CREDIT') {
          const dueDate = new Date();
          dueDate.setDate(
            dueDate.getDate() + (customer.creditPeriodDays || 30)
          );

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
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 20000,
      }
    );

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

  async getTransactions(query) {
    const {
      page = 1,
      limit = 10,
      search,
      paymentMethod,
      customerId,
      dateFrom,
      dateTo,
    } = query;

    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { gatePassNo: { contains: search, mode: 'insensitive' } },
        { fsNo: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = new Date(dateFrom);
      if (dateTo) where.transactionDate.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      prisma.saleTransaction.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.saleTransaction.count({ where }),
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

module.exports = new PosService();