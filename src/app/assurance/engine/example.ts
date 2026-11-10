import { DEFAULT_TAX_RATE } from './blank';
import { ScenarioInput } from './types';

/** Round fictional numbers. Not a real policy. */
export function exampleScenario(): ScenarioInput {
  return {
    profile: { currentAge: 30, horizonAge: 70 },
    permanent: {
      premium: 100,
      periodicity: 'month',
      deathBenefit: 100_000,
      inForce: true,
      cashValueNow: 1_000,
      premiumYearsRemaining: 20,
      projectedGrowth: 0.02,
      anchors: [
        { age: 30, guaranteed: 0, projected: null },
        { age: 50, guaranteed: 15_000, projected: 25_000 },
        { age: 70, guaranteed: 40_000, projected: 70_000 },
      ],
    },
    term: {
      premium: 20,
      periodicity: 'month',
      deathBenefit: 250_000,
      durationYears: 25,
    },
    params: {
      annualReturn: 0.06,
      reinvestShare: 1,
      extraSavingsMonthly: 0,
      account: 'tfsa',
      taxRate: DEFAULT_TAX_RATE,
      taxRateLater: DEFAULT_TAX_RATE,
      realDollars: false,
      inflation: 0.02,
    },
  };
}
