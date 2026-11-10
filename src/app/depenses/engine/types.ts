import { Money } from '../../shared/engine/money';

/**
 * How often the spending comes back: X times a day, week or month, or once every X
 * days, weeks or months.
 */
export type Cadence =
  'perDay' | 'everyDays' | 'perWeek' | 'everyWeeks' | 'perMonth' | 'everyMonths';

/** In display order. */
export const CADENCES: readonly Cadence[] = [
  'perDay',
  'everyDays',
  'perWeek',
  'everyWeeks',
  'perMonth',
  'everyMonths',
];

/** The year in days, weeks and months: 52 weeks fall one day short of 365 days. */
export const PERIODS_PER_YEAR: Record<Cadence, number> = {
  perDay: 365,
  everyDays: 365,
  perWeek: 52,
  everyWeeks: 52,
  perMonth: 12,
  everyMonths: 12,
};

/** True for « X fois par … », false for « aux X … ». */
export function isTimesPer(cadence: Cadence): boolean {
  return cadence.startsWith('per');
}

export interface SpendingInput {
  /** What one occurrence costs, as paid. */
  amount: number;
  /** The X of the cadence, a whole number. */
  count: number;
  cadence: Cadence;
  years: number;
  /** Effective yearly return of the investment, as a fraction. */
  annualReturn: number;
  /** The price rises by `inflation` at the start of each new year. */
  priceGrowth: boolean;
  /** As a fraction; used only with `priceGrowth`. */
  inflation: number;
}

export interface SpendingResult {
  input: SpendingInput;
  /** Occurrences in a year, not rounded. */
  timesPerYear: number;
  /** What the spending costs in its first year. */
  perYear: Money;
  /** What it costs over all the years, rising prices included. */
  total: Money;
  /** The same sums, deposited each month and invested: the opportunity cost. */
  invested: Money;
  /** What of `invested` comes from interest. */
  interest: Money;
}
