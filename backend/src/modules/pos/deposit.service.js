// backend/src/modules/pos/deposit.service.js

const { AppError } = require('../../middleware/error.middleware');

class DepositService {
  async createDepositAllocations(tx, saleTransactionId, allocations, expectedTotal) {
    if (!allocations || allocations.length === 0) {
      throw new AppError('At least one deposit allocation is required for Cash payment', 400);
    }

    const totalAllocated = allocations.reduce((sum, a) => sum + Number(a.amount), 0);

    // Allow small rounding difference (0.01)
    if (Math.abs(totalAllocated - Number(expectedTotal)) > 0.01) {
      throw new AppError(
        `Deposit allocations (${totalAllocated}) must equal Gate Pass total (${expectedTotal})`,
        400
      );
    }

    const created = [];

    for (const allocation of allocations) {
      const record = await tx.depositAllocation.create({
        data: {
          saleTransactionId,
          accountName: allocation.accountName,
          bankName: allocation.bankName,
          amount: allocation.amount,
        },
      });
      created.push(record);
    }

    return created;
  }
}

module.exports = new DepositService();