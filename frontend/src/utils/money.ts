function toScaled(value: string | number, scale: number): bigint {
  const raw = String(value ?? "0").trim();
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole, fraction = ""] = unsigned.split(".");
  const padded = (fraction + "0".repeat(scale)).slice(0, scale);
  const digits = `${whole || "0"}${padded}`.replace(/^(-?)0+(?=\d)/, "$1");
  const asBig = BigInt(digits || "0");
  return negative ? -asBig : asBig;
}

export function moneyMul(quantity: string | number, unitPrice: string | number): string {
  const qty = toScaled(quantity, 4);
  const price = toScaled(unitPrice, 2);
  const product = qty * price;
  const scale = 10n ** 6n;
  const whole = product / scale;
  const remainder = product % scale;
  const rounded = remainder * 2n >= scale ? whole + (product < 0n ? -1n : 1n) : whole;
  const cents = rounded;
  const sign = cents < 0n ? "-" : "";
  const abs = cents < 0n ? -cents : cents;
  const dollars = abs / 100n;
  const leftover = (abs % 100n).toString().padStart(2, "0");
  return `${sign}${dollars}.${leftover}`;
}

export function moneyAdd(...values: Array<string | number>): string {
  const total = values.reduce((sum, value) => sum + toScaled(value, 2), 0n);
  const sign = total < 0n ? "-" : "";
  const abs = total < 0n ? -total : total;
  const dollars = abs / 100n;
  const cents = (abs % 100n).toString().padStart(2, "0");
  return `${sign}${dollars}.${cents}`;
}

export function moneyTax(subtotal: string | number, ratePercent = "15"): string {
  const sub = toScaled(subtotal, 2);
  const rate = toScaled(ratePercent, 2);
  const product = sub * rate;
  const scaled = product / 10000n;
  const remainder = product % 10000n;
  const rounded = remainder >= 5000n ? scaled + 1n : scaled;
  const sign = rounded < 0n ? "-" : "";
  const abs = rounded < 0n ? -rounded : rounded;
  const dollars = abs / 100n;
  const cents = (abs % 100n).toString().padStart(2, "0");
  return `${sign}${dollars}.${cents}`;
}
