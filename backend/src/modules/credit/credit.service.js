// backend/src/modules/credit/credit.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { paginate } = require('../../utils/helpers');
const { toMoneyString, isPositive, d } = require('../../utils/money');
const { applyCreditPayment } = require('../../utils/atomic-balance');

class CreditService {
  async getCreditOverview({ page = 1, limit = 20, status, search, overdue }) {
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);
    const where = {};
    if (status) where.status = status;

    if (search) {
      where.customer = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { tinNo: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (overdue === 'true' || overdue === true) {
      where.status = where.status || { not: 'SETTLED' };
      where.dueDate = { lt: new Date() };
    }

    const [data, total] = await Promise.all([
      prisma.creditLedger.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, creditLimit: true, tinNo: true },
          },
          saleTransaction: {
            select: { id: true, gatePassNo: true, fsNo: true, transactionDate: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take,
      }),
      prisma.creditLedger.count({ where }),
    ]);

    const mapped = data.map((ledger) => {
      const outstanding = d(ledger.debitAmount).minus(d(ledger.creditAmount)).toFixed(2);
      const limit = toMoneyString(ledger.customer.creditLimit);
      const availableCredit = d(limit).minus(d(outstanding)).toFixed(2);

      return {
        ...ledger,
        outstanding,
        availableCredit,
      };
    });

    return {
      data: mapped,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0,
      },
    };
  }

  async recordPayment(data, userId) {
    const { customerId, creditLedgerId, amount, paymentDate, reference, accountName, bankName, notes } = data;

    if (!customerId || !amount) {
      throw new AppError('customerId and amount are required', 400);
    }

    if (!isPositive(amount)) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const payment = await prisma.$transaction(async (tx) => {
      const application = await applyCreditPayment(tx, {
        customerId,
        creditLedgerId: creditLedgerId || null,
        amount,
      });

      const createdPayment = await tx.payment.create({
        data: {
          customerId,
          creditLedgerId: creditLedgerId || application.applied[0]?.ledgerId || null,
          amount: toMoneyString(amount),
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          reference,
          accountName,
          bankName,
          notes,
          enteredById: userId,
        },
      });

      return { ...createdPayment, application };
    });

    return payment;
  }

  async getCustomerCreditSummary(customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const aggregates = await prisma.creditLedger.aggregate({
      where: { customerId },
      _sum: {
        debitAmount: true,
        creditAmount: true,
      },
    });

    const totalDebit = d(aggregates._sum.debitAmount || 0);
    const totalCredit = d(aggregates._sum.creditAmount || 0);
    const outstanding = totalDebit.minus(totalCredit).toFixed(2);
    const creditLimit = toMoneyString(customer.creditLimit);

    return {
      customerId,
      creditLimit,
      outstanding,
      availableCredit: d(creditLimit).minus(d(outstanding)).toFixed(2),
    };
  }
}

module.exports = new CreditService();
