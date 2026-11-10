import { Limit } from '../../shared/engine/limits';

/** Rates are in percent, as typed. */
export const FEES_LIMITS = {
  initialAmount: { min: 0, max: 10_000_000 },
  monthlyContribution: { min: 0, max: 50_000 },
  years: { min: 1, max: 60 },
  /** Past it, decades of compounding give sums unrelated to any real portfolio. */
  returnPercent: { min: 0, max: 12 },
  merPercent: { min: 0, max: 5 },
  advisorPercent: { min: 0, max: 3 },
  /** Above Quebec's highest marginal rate, with room to spare. */
  taxPercent: { min: 0, max: 60 },
  drawdownYears: { min: 1, max: 50 },
  inflationPercent: { min: 0, max: 10 },
} satisfies Record<string, Limit>;
