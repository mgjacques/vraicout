import { Limit } from '../../shared/engine/limits';

/** Rates are in percent, as typed. */
export const SPENDING_LIMITS = {
  /** A year of rent paid at once: well past any everyday spending. */
  amount: { min: 0, max: 100_000 },
  /** « Aux 365 jours » is once a year; the X is a whole number. */
  count: { min: 1, max: 365 },
  /** A working life. */
  years: { min: 1, max: 50 },
  /** Past it, decades of compounding give sums unrelated to any real portfolio. */
  returnPercent: { min: 0, max: 12 },
  inflationPercent: { min: 0, max: 10 },
} satisfies Record<string, Limit>;
