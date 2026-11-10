/** An effective yearly rate as the monthly one that gives the same result over twelve months: (1 + rate)^(1/12) − 1. */
export function toMonthlyRate(annual: number): number {
  return Math.pow(1 + annual, 1 / 12) - 1;
}
