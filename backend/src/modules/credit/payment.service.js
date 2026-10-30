// backend/src/modules/credit/payment.service.js

const prisma = require('../../prisma/client');
const { AppError } = require('../../middleware/error.middleware');

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

    if (Number(amount) <= 0) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

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

      // Update credit ledger if provided
      if (creditLedgerId) {
        const ledger = await tx.creditLedger.findUnique({
          where: { id: creditLedgerId },
        });

        if (!ledger) {
          throw new AppError('Credit ledger not found', 404);
        }

        await tx.creditLedger.update({
          where: { id: creditLedgerId },
          data: {
            creditAmount: {
              increment: amount,
            },
          },
        });
      }

      return createdPayment;
    });

    return payment;
  }

  async getPaymentsByCustomer(customerId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

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
        take: Number(limit),
      }),
      prisma.payment.count({ where: { customerId } }),
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

module.exports = new PaymentService();