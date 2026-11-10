/** The year of every figure below. */
export const TAX_YEAR = 2026;

/** A bracket's rate applies to the income up to `upTo`; the last one has no ceiling. */
export interface Bracket {
  upTo: number | null;
  rate: number;
}

/** Québec tax table: Ministère des Finances, parameters of the tax system for 2026. */
export const QUEBEC_BRACKETS: readonly Bracket[] = [
  { upTo: 54_345, rate: 0.14 },
  { upTo: 108_680, rate: 0.19 },
  { upTo: 132_245, rate: 0.24 },
  { upTo: null, rate: 0.2575 },
];

export const QUEBEC_BASIC_AMOUNT = 18_952;

/** Québec's non-refundable credits are worth the first bracket's rate. */
export const QUEBEC_CREDIT_RATE = 0.14;

/** Federal brackets: CRA, 2026 federal tax rates and income thresholds. */
export const FEDERAL_BRACKETS: readonly Bracket[] = [
  { upTo: 58_523, rate: 0.14 },
  { upTo: 117_045, rate: 0.205 },
  { upTo: 181_440, rate: 0.26 },
  { upTo: 258_482, rate: 0.29 },
  { upTo: null, rate: 0.33 },
];

/**
 * The federal basic personal amount: the full amount up to the fourth bracket, then down in a
 * straight line to the minimum at the fifth (CRA, form TD1-WS 2026).
 */
export const FEDERAL_BASIC = {
  max: 16_452,
  min: 14_829,
  phaseStart: 181_440,
  phaseEnd: 258_482,
};

/** Federal credits are worth the lowest bracket's rate. */
export const FEDERAL_CREDIT_RATE = 0.14;

/** Québec residents take this share off their basic federal tax. */
export const QUEBEC_ABATEMENT = 0.165;

/** Tax on `income` from the brackets alone, before any credit. */
export function bracketTax(income: number, brackets: readonly Bracket[]): number {
  let tax = 0;
  let floor = 0;
  for (const { upTo, rate } of brackets) {
    const top = upTo ?? Infinity;
    if (income <= floor) break;
    tax += (Math.min(income, top) - floor) * rate;
    floor = top;
  }
  return tax;
}

/** The rate of the dollar right after `income`: at a threshold, the bracket above. */
export function bracketRate(income: number, brackets: readonly Bracket[]): number {
  const bracket = brackets.find(({ upTo }) => upTo === null || income < upTo);
  return bracket?.rate ?? 0;
}

/** The federal basic personal amount for this net income. */
export function federalBasicAmount(income: number): number {
  const { max, min, phaseStart, phaseEnd } = FEDERAL_BASIC;
  if (income <= phaseStart) return max;
  if (income >= phaseEnd) return min;
  return min + ((max - min) * (phaseEnd - income)) / (phaseEnd - phaseStart);
}

/** What each dollar of the phase-out takes off the federal credit, before the abatement. */
export function federalCreditLoss(income: number): number {
  const { max, min, phaseStart, phaseEnd } = FEDERAL_BASIC;
  if (income < phaseStart || income >= phaseEnd) return 0;
  return (FEDERAL_CREDIT_RATE * (max - min)) / (phaseEnd - phaseStart);
}

/** Every income where the combined marginal rate may change, in order: the chart's steps. */
export function rateThresholds(): number[] {
  const tops = (brackets: readonly Bracket[]) =>
    brackets.flatMap(({ upTo }) => (upTo === null ? [] : [upTo]));
  return [
    ...new Set([
      0,
      // Where the basic personal amount stops wiping out the tax: the first bracket's rate
      // is the credit rate, so it is the amount itself.
      FEDERAL_BASIC.max,
      QUEBEC_BASIC_AMOUNT,
      ...tops(FEDERAL_BRACKETS),
      ...tops(QUEBEC_BRACKETS),
      FEDERAL_BASIC.phaseStart,
      FEDERAL_BASIC.phaseEnd,
    ]),
  ].sort((a, b) => a - b);
}
