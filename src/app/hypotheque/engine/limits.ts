import { Limit } from '../../shared/engine/limits';

/** Rates are in percent, as typed. */
export const MORTGAGE_LIMITS = {
  loanAmount: { min: 0, max: 5_000_000 },
  /** Most loans run 25 or 30 years; 40 leaves room. */
  years: { min: 1, max: 40 },
  /** Rates have not been this high since the early 1980s. */
  ratePercent: { min: 0, max: 15 },
  /** Per month. */
  premium: { min: 0, max: 5_000 },
  termAmount: { min: 0, max: 10_000_000 },
} satisfies Record<string, Limit>;
