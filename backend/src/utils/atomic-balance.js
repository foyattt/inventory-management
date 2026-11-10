// backend/src/utils/atomic-balance.js

const { Prisma } = require('@prisma/client');
const { AppError } = require('../middleware/error.middleware');
const { toQtyString, toMoneyString, d, moneyAdd, toMoney } = require('./money');

function asDecimal(value, scaleFn) {
  return new Prisma.Decimal(scaleFn(value));
}

async function decrementStockBalance(tx, stockSourceId, quantity) {
  const qty = asDecimal(quantity, toQtyString);
  const rows = await tx.$queryRaw`
    UPDATE "stock_sources"
    SET "currentBalance" = "currentBalance" - ${qty},
        "updatedAt" = NOW()
    WHERE "id" = ${stockSourceId}
      AND "currentBalance" >= ${qty}
    RETURNING "id", "currentBalance", "batchCode"
  `;

  if (!rows.length) {
    throw new AppError('Insufficient stock in the selected batch', 400);
  }

  return rows[0];
}

async function incrementStockBalance(tx, stockSourceId, quantity) {
  const qty = asDecimal(quantity, toQtyString);
  const rows = await tx.$queryRaw`
    UPDATE "stock_sources"
    SET "currentBalance" = "currentBalance" + ${qty},
        "updatedAt" = NOW()
    WHERE "id" = ${stockSourceId}
    RETURNING "id", "currentBalance", "batchCode"
  `;

  if (!rows.length) {
    throw new AppError('Stock source not found', 404);
  }

  return rows[0];
}

async function lockOpenCreditLedgers(tx, customerId, creditLedgerId) {
  if (creditLedgerId) {
    return tx.$queryRaw`
      SELECT *
      FROM "credit_ledgers"
      WHERE "id" = ${creditLedgerId}
      FOR UPDATE
    `;
  }

  return tx.$queryRaw`
    SELECT *
    FROM "credit_ledgers"
    WHERE "customerId" = ${customerId}
      AND "debitAmount" > "creditAmount"
    ORDER BY "dueDate" ASC NULLS LAST, "createdAt" ASC
    FOR UPDATE
  `;
}

async function applyCreditPayment(tx, { customerId, creditLedgerId, amount }) {
  const remainingStart = toMoney(amount);
  if (remainingStart.lte(0)) {
    throw new AppError('Payment amount must be greater than zero', 400);
  }

  const ledgers = await lockOpenCreditLedgers(tx, customerId, creditLedgerId);
  if (!ledgers.length) {
    throw new AppError(
      creditLedgerId ? 'Credit ledger not found' : 'No outstanding credit found for this customer',
      404
    );
  }

  let remaining = remainingStart;
  const applied = [];

  for (const ledger of ledgers) {
    if (remaining.lte(0)) break;

    const outstanding = toMoney(ledger.debitAmount).minus(toMoney(ledger.creditAmount));
    if (outstanding.lte(0)) continue;

    const applyAmount = outstanding.lt(remaining) ? outstanding : remaining;
    const amt = asDecimal(applyAmount, toMoneyString);

    const updated = await tx.$queryRaw`
      UPDATE "credit_ledgers"
      SET
        "creditAmount" = "creditAmount" + ${amt},
        "status" = CASE
          WHEN "debitAmount" - ("creditAmount" + ${amt}) <= 0 THEN 'SETTLED'::"CreditStatus"
          WHEN "dueDate" IS NOT NULL AND "dueDate" < NOW() THEN 'OVERDUE'::"CreditStatus"
          ELSE "status"
        END,
        "updatedAt" = NOW()
      WHERE "id" = ${ledger.id}
        AND "debitAmount" - "creditAmount" >= ${amt}
      RETURNING "id", "creditAmount", "debitAmount", "status"
    `;

    if (!updated.length) {
      throw new AppError('Credit balance changed during payment. Please retry.', 409);
    }

    applied.push({ ledgerId: ledger.id, amount: toMoneyString(applyAmount) });
    remaining = remaining.minus(applyAmount);
  }

  if (creditLedgerId && remaining.gt(0)) {
    throw new AppError(
      `Payment exceeds outstanding balance on this ledger by ${toMoneyString(remaining)}`,
      400
    );
  }

  if (!creditLedgerId && remaining.gt(0)) {
    throw new AppError(
      `Payment exceeds total outstanding credit by ${toMoneyString(remaining)}`,
      400
    );
  }

  const totalApplied = applied.reduce((sum, row) => moneyAdd(sum, row.amount), '0.00');
  return { applied, totalApplied };
}

function prismaDecimal(value, scaleFn = toMoneyString) {
  return asDecimal(value, scaleFn);
}

module.exports = {
  decrementStockBalance,
  incrementStockBalance,
  applyCreditPayment,
  lockOpenCreditLedgers,
  prismaDecimal,
  d,
};
