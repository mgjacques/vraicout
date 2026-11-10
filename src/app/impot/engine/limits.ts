import { Limit } from '../../shared/engine/limits';
import { ANNUAL_PAY_MAX } from '../../shared/engine/pay';

export const MARGINAL_LIMITS = {
  /** The same high personal income as the pay in the other tools. Past it, the top rate never changes. */
  income: { min: 0, max: ANNUAL_PAY_MAX },
  /** A large bonus or a year's contract on top of a salary. */
  extra: { min: 0, max: 500_000 },
} satisfies Record<string, Limit>;
