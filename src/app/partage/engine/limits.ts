import { Limit } from '../../shared/engine/limits';

/** The salary's cap depends on the pay frequency: see `payMax` in shared/engine/pay.ts. */
export const SPLIT_LIMITS = {
  /** A large shared expense, such as a year of rent. */
  bill: { min: 0, max: 100_000 },
} satisfies Record<string, Limit>;
