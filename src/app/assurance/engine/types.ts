export type Periodicity = 'month' | 'year';

export type TermDuration = 10 | 20 | 25 | 30;

export type StrategyId = 'keep' | 'termInvest';

import type { Account, FormulaParams, FormulaStep, Money } from '../../shared/engine/money';

export type { Account, FormulaParams, FormulaStep, Money };

export type MilestoneKind = 'beforeTermEnd' | 'termEnd' | 'age65' | 'horizon';

export type InterpMethod = 'flat' | 'hold' | 'anchor' | 'linear' | 'exp';

/** Age is an attained age. Null means the user did not enter that column. */
export interface ValueAnchor {
  age: number;
  guaranteed: number | null;
  projected: number | null;
}

export interface ScenarioInput {
  profile: {
    currentAge: number;
    /** 0 asks the engine for the default horizon. */
    horizonAge: number;
  };
  permanent: {
    premium: number;
    periodicity: Periodicity;
    deathBenefit: number;
    /**
     * The contract is already in force. The term side then ends it today and invests its cash
     * value from the first month, so both options start from the same amount.
     */
    inForce: boolean;
    cashValueNow: number;
    premiumYearsRemaining: number;
    /** Annual growth of the projected death benefit. 0 hides the projected series. */
    projectedGrowth: number;
    anchors: ValueAnchor[];
  };
  term: {
    premium: number;
    periodicity: Periodicity;
    deathBenefit: number;
    durationYears: TermDuration;
  };
  params: {
    /** Nominal annual rate as a fraction, from 0 to 0.10. Divided by 12 in the loop. */
    annualReturn: number;
    /** Share of the monthly budget gap that is really invested, from 0 to 1. Applies to both sides. */
    reinvestShare: number;
    extraSavingsMonthly: number;
    /** Account for every invested amount, on both sides, so the comparison stays even. */
    account: Account;
    /** Marginal tax rate today, from 0 to 0.6. RRSP refund and taxable gains use it. */
    taxRate: number;
    /** Marginal tax rate when an RRSP is withdrawn, from 0 to 0.6. */
    taxRateLater: number;
    /** Show every amount in today's dollars, discounted by this yearly inflation. */
    realDollars: boolean;
    /** Yearly inflation as a fraction, from 0 to 0.1. */
    inflation: number;
  };
}

export interface StrategySnapshot {
  id: StrategyId;
  cost: Money;
  deathBenefit: Money;
  deathBenefitProjected: Money | null;
  alive: Money;
  aliveGuaranteed: Money | null;
  /** Keep side only: the gap invested in months when the term side costs more. Null when that never happens. */
  gapSavings: Money | null;
  extraSavings: Money;
  aliveCombined: Money;
  /** What the person could take out if alive: cash value and invested money, extra savings left out. */
  inHand: Money;
  /** Keep side only: the same, with the guaranteed cash value. Null before the first guaranteed value. */
  inHandGuaranteed: Money | null;
  /** What the heirs would receive: the insurance and the invested money, extra savings left out. */
  forHeirs: Money;
  /** Keep side only: the same, with the non-guaranteed growth of the death benefit. */
  forHeirsProjected: Money | null;
}

export interface YearRow {
  age: number;
  month: number;
  calendarYear: number;
  strategies: StrategySnapshot[];
}

export interface Milestone {
  month: number;
  age: number;
  kinds: MilestoneKind[];
  strategies: StrategySnapshot[];
}

export interface ChartPoint {
  age: number;
  month: number;
  value: number | null;
}

export type SeriesId =
  | 'keepHeirs'
  | 'keepHeirsProjected'
  | 'termHeirs'
  | 'keepInHand'
  | 'keepInHandGuaranteed'
  | 'extra'
  | 'termInHand';

/** Solid: the total « En bref » counts. Dashed: a variant of the same option. */
export interface ChartSeries {
  id: SeriesId;
  chart: 'death' | 'alive';
  dashed: boolean;
  points: ChartPoint[];
}

/**
 * A run of months in which both outlays stay the same.
 * Months are 1-based and inclusive. The side that pays less invests the gap.
 */
export interface BudgetPhase {
  fromMonth: number;
  toMonth: number;
  keepMonthly: number;
  termMonthly: number;
  side: StrategyId | null;
  gap: number;
  deposit: number;
  spent: number;
}

export interface Assumptions {
  permMonthly: number;
  termMonthly: number;
  phases: BudgetPhase[];
  /** True when some month sends part of the gap to the keep side. */
  keepInvests: boolean;
  reinvestShare: number;
  annualReturn: number;
  extraMonthly: number;
  account: Account;
  taxRate: number;
  taxRateLater: number;
  realDollars: boolean;
  inflation: number;
  /** Cash value the term side receives today by ending a contract already in force; 0 otherwise. */
  surrender: number;
  premiumMonths: number;
  termMonths: number;
  termYears: number;
  projectedGrowth: number;
  /** True when at least one future projected (or guaranteed) cash value was entered. */
  cashScale: boolean;
}

export interface Projection {
  currentAge: number;
  horizonAge: number;
  termEndAge: number;
  paidUpAge: number;
  nowYear: number;
  assumptions: Assumptions;
  years: YearRow[];
  milestones: Milestone[];
  /** The last month the term still pays, drawn on the death chart so its end is a vertical drop. Null without one. */
  beforeTermEnd: YearRow | null;
  series: ChartSeries[];
}
