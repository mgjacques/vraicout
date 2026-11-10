import { Money } from '../../shared/engine/money';

export interface MarginalInput {
  /** Taxable income for the year, the same for both levels. */
  income: number;
  /** Income added on top (a raise, overtime); 0 without. */
  extra: number;
}

/** One level of government: its rate on the next dollar and its tax for the year. */
export interface LevelTax {
  /** In percent, after the Québec abatement for the federal level. */
  rate: Money;
  tax: Money;
}

/** The marginal rates from `from` to the next step, in percent: the chart and the table. */
export interface RateStep {
  from: number;
  federalPercent: number;
  quebecPercent: number;
  percent: number;
}

export interface MarginalResult {
  input: MarginalInput;
  federal: LevelTax;
  quebec: LevelTax;
  /** Federal and Québec rates added, in percent. */
  marginal: Money;
  total: Money;
  /** Total tax over the income, in percent. */
  average: Money;
  /** What the extra income adds in tax and leaves in hand; null without one. */
  extra: { tax: Money; kept: Money; rate: Money } | null;
  /** The combined rate for every income, for the chart. */
  steps: readonly RateStep[];
}
