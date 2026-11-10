// backend/src/modules/pos/deposit.service.js

const { AppError } = require('../../middleware/error.middleware');
const { moneyAdd, moneyEquals, toMoneyString } = require('../../utils/money');

class DepositService {
  async createDepositAllocations(tx, saleTransactionId, allocations, expectedTotal) {
    if (!allocations || allocations.length === 0) {
      throw new AppError('At least one deposit allocation is required for Cash payment', 400);
    }

    const totalAllocated = allocations.reduce(
      (sum, allocation) => moneyAdd(sum, allocation.amount),
      '0.00'
    );

    if (!moneyEquals(totalAllocated, expectedTotal)) {
      throw new AppError(
        `Deposit allocations (${totalAllocated}) must equal Gate Pass total (${toMoneyString(expectedTotal)})`,
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
          amount: toMoneyString(allocation.amount),
        },
      });
      created.push(record);
    }

    return created;
  }
}

module.exports = new DepositService();
