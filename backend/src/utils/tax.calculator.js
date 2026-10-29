// backend/src/utils/tax.calculator.js

const TAX_RATE = 15; // 15%

function calculateLineTotal(quantity, unitPrice) {
  const qty = Number(quantity);
  const price = Number(unitPrice);
  return Number((qty * price).toFixed(2));
}

function calculateTax(subtotal) {
  return Number(((Number(subtotal) * TAX_RATE) / 100).toFixed(2));
}

function calculateTotals(items = []) {
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateLineTotal(item.quantity, item.unitPrice);
  }, 0);

  const taxAmount = calculateTax(subtotal);
  const total = Number((subtotal + taxAmount).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount,
    total,
    taxRate: TAX_RATE,
  };
}

module.exports = {
  TAX_RATE,
  calculateLineTotal,
  calculateTax,
  calculateTotals,
};