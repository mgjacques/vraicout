import { Limit } from '../../shared/engine/limits';

/** The pay's cap depends on the pay frequency: see `payMax` in shared/engine/pay.ts. */
export const HOURS_LIMITS = {
  /** Two full-time jobs. */
  hoursPerWeek: { min: 1, max: 80 },
  workCosts: { min: 0, max: 10_000 },
  /** A house. */
  price: { min: 0, max: 5_000_000 },
} satisfies Record<string, Limit>;
