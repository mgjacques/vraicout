import { Limit } from '../../shared/engine/limits';

/** Rates are in percent, as typed. */
export const SAVINGS_LIMITS = {
  initialAmount: { min: 0, max: 10_000_000 },
  monthlyDeposit: { min: 0, max: 50_000 },
  /** A whole working life, from a first job to retirement. */
  depositYears: { min: 1, max: 60 },
  /** From a stop at 40 to 100: enough for any life, too short for absurd sums. */
  growthYears: { min: 0, max: 60 },
  /** Past it, decades of compounding give sums unrelated to any real portfolio. */
  returnPercent: { min: 0, max: 12 },
  /** It must also stay below the deposit years: see `missingSavingsFields`. */
  delayYears: { min: 0, max: 59 },
  inflationPercent: { min: 0, max: 10 },
} satisfies Record<string, Limit>;
