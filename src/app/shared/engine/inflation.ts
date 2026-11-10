/** What 1 $ in `months` months is worth in today's dollars. */
export function discountFactor(inflation: number, months: number): number {
  return Math.pow(1 + inflation, -months / 12);
}

/** Sum over k = 1..months of (1 + inflation)^(-k / 12): what months of 1 $ payments are worth today. */
export function presentValueFactor(inflation: number, months: number): number {
  if (months <= 0) return 0;
  if (inflation <= 0) return months;
  const discount = Math.pow(1 + inflation, -1 / 12);
  return (discount * (1 - Math.pow(discount, months))) / (1 - discount);
}
