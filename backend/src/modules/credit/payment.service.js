// backend/src/modules/credit/payment.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');
const { paginate } = require('../../utils/helpers');
const { toMoneyString, isPositive } = require('../../utils/money');
const { applyCreditPayment } = require('../../utils/atomic-balance');

class PaymentService {
  async recordPayment(data, userId) {
    const {
      customerId,
      creditLedgerId,
      amount,
      paymentDate,
      reference,
      accountName,
      bankName,
      notes,
    } = data;

    if (!customerId || !amount) {
      throw new AppError('customerId and amount are required', 400);
    }

    if (!isPositive(amount)) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

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

  async getPaymentsByCustomer(customerId, { page = 1, limit = 20 } = {}) {
    const { skip, take, page: pageNum, limit: limitNum } = paginate(page, limit);

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where: { customerId },
        include: {
          enteredBy: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { paymentDate: 'desc' },
        skip,
        take,
      }),
      prisma.payment.count({ where: { customerId } }),
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

module.exports = new PaymentService();
