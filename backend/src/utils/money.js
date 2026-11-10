// backend/src/utils/money.js

const Decimal = require('decimal.js');

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

const MONEY_DP = 2;
const QTY_DP = 4;

function d(value) {
  if (value === null || value === undefined || value === '') {
    return new Decimal(0);
  }
  if (value instanceof Decimal) {
    return value;
  }
  return new Decimal(String(value));
}

function toMoney(value) {
  return d(value).toDecimalPlaces(MONEY_DP, Decimal.ROUND_HALF_UP);
}

function toQty(value) {
  return d(value).toDecimalPlaces(QTY_DP, Decimal.ROUND_HALF_UP);
}

function toMoneyString(value) {
  return toMoney(value).toFixed(MONEY_DP);
}

function toQtyString(value) {
  return toQty(value).toFixed(QTY_DP);
}

function moneyAdd(...values) {
  return values
    .reduce((acc, value) => acc.plus(toMoney(value)), new Decimal(0))
    .toDecimalPlaces(MONEY_DP, Decimal.ROUND_HALF_UP)
    .toFixed(MONEY_DP);
}

function qtyAdd(...values) {
  return values
    .reduce((acc, value) => acc.plus(toQty(value)), new Decimal(0))
    .toDecimalPlaces(QTY_DP, Decimal.ROUND_HALF_UP)
    .toFixed(QTY_DP);
}

function moneyMul(a, b, dp = MONEY_DP) {
  return d(a)
    .times(d(b))
    .toDecimalPlaces(dp, Decimal.ROUND_HALF_UP)
    .toFixed(dp);
}

function moneyEquals(a, b) {
  return toMoney(a).eq(toMoney(b));
}

function isPositive(value) {
  return d(value).gt(0);
}

function cmp(a, b) {
  return d(a).comparedTo(d(b));
}

module.exports = {
  Decimal,
  d,
  toMoney,
  toQty,
  toMoneyString,
  toQtyString,
  toQtyNumber,      // add this
  toMoneyNumber,
  moneyAdd,
  qtyAdd,
  moneyMul,
  moneyEquals,
  isPositive,
  cmp,
  MONEY_DP,
  QTY_DP,
};

function toQtyNumber(value) {
  return Number(toQty(value).toFixed(QTY_DP));
}

function toMoneyNumber(value) {
  return Number(toMoney(value).toFixed(MONEY_DP));
}