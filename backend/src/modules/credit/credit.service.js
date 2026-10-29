// backend/src/modules/credit/credit.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');

class CreditService {
  async getCreditOverview({ page = 1, limit = 20, status }) {
    const skip = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.creditLedger.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, creditLimit: true },
          },
          saleTransaction: {
            select: { id: true, gatePassNo: true, fsNo: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.creditLedger.count({ where }),
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

  async recordPayment(data, userId) {
    const { customerId, creditLedgerId, amount, paymentDate, reference, accountName, bankName, notes } = data;

    if (!customerId || !amount) {
      throw new AppError('customerId and amount are required', 400);
    }

    if (Number(amount) <= 0) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          customerId,
          creditLedgerId: creditLedgerId || null,
          amount,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          reference,
          accountName,
          bankName,
          notes,
          enteredById: userId,
        },
      });

      if (creditLedgerId) {
        await tx.creditLedger.update({
          where: { id: creditLedgerId },
          data: {
            creditAmount: { increment: amount },
          },
        });
      }

      return createdPayment;
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

    const totalDebit = Number(aggregates._sum.debitAmount || 0);
    const totalCredit = Number(aggregates._sum.creditAmount || 0);
    const outstanding = totalDebit - totalCredit;

    return {
      customerId,
      creditLimit: Number(customer.creditLimit),
      outstanding,
      availableCredit: Number(customer.creditLimit) - outstanding,
    };
  }
}

module.exports = new CreditService();