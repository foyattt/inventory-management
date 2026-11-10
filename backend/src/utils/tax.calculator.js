// backend/src/utils/tax.calculator.js

const { moneyMul, moneyAdd, toMoneyString } = require('./money');

const TAX_RATE = '15.00';

function calculateLineTotal(quantity, unitPrice) {
  return moneyMul(quantity, unitPrice, 2);
}

function calculateTax(subtotal, taxRate = TAX_RATE) {
  return moneyMul(subtotal, moneyMul(taxRate, '0.01', 4), 2);
}

function calculateTotals(items = [], taxRate = TAX_RATE) {
  const subtotal = items.reduce(
    (sum, item) => moneyAdd(sum, calculateLineTotal(item.quantity, item.unitPrice)),
    '0.00'
  );

  const taxAmount = calculateTax(subtotal, taxRate);
  const total = moneyAdd(subtotal, taxAmount);

  return {
    subtotal: toMoneyString(subtotal),
    taxAmount: toMoneyString(taxAmount),
    total: toMoneyString(total),
    taxRate: toMoneyString(taxRate),
  };
}

module.exports = {
  TAX_RATE,
  calculateLineTotal,
  calculateTax,
  calculateTotals,
};
