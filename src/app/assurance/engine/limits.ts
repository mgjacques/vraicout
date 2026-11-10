import { Limit } from '../../shared/engine/limits';

/** Rates are in percent, as typed. */
export const INSURANCE_LIMITS = {
  age: { min: 0, max: 100 },
  /** Contracts mature at 100, some at 121; 110 shows the end of nearly all of them. */
  horizonAge: { min: 0, max: 110 },
  /** Monthly or yearly: a yearly premium on a large policy can pass 100 000 $. */
  premium: { min: 0, max: 250_000 },
  deathBenefit: { min: 0, max: 10_000_000 },
  /** Cash values, today or in the contract's table: projected over decades, they grow large. */
  cashValue: { min: 0, max: 20_000_000 },
  premiumYears: { min: 0, max: 80 },
  growthPercent: { min: 0, max: 10 },
  extraSavings: { min: 0, max: 20_000 },
  taxPercent: { min: 0, max: 60 },
  inflationPercent: { min: 0, max: 10 },
} satisfies Record<string, Limit>;

/**
 * Markers of the return slider, in percent: the 2026 projection assumption guidelines of
 * IQPF and FP Canada, before fees (short term 2,4 %, fixed income 3,2 %, equities 6,3 % to 6,6 %).
 */
export const RETURN_MARKERS = { shortTerm: 2.4, bonds: 3.2, equities: 6.5 } as const;
