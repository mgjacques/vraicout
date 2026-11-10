import type { Account, Money } from '../../shared/engine/money';

export type PortfolioId = 'a' | 'b';

/** The two yearly fees taken from a portfolio, as fractions. */
export interface FeeSet {
  /** Name the person gives the portfolio ("Fonds commun", "FNB"…). */
  label: string;
  /** Management expense ratio (RFG), from 0 to 0.05. */
  mer: number;
  /** Advisor or platform fee charged on top of the MER, from 0 to 0.03. */
  advisorFee: number;
}

export interface FeesInput {
  initialAmount: number;
  monthlyContribution: number;
  /** Years of saving before retirement, from 1 to 60. */
  years: number;
  /** Yearly return before fees, as a fraction from 0 to 0.15. The same for both portfolios. */
  grossReturn: number;
  portfolios: Record<PortfolioId, FeeSet>;
  account: Account;
  taxRate: number;
  taxRateLater: number;
  /** Show every amount in today's dollars. */
  realDollars: boolean;
  /** Yearly inflation: today's dollars, and the yearly raise of retirement withdrawals. */
  inflation: number;
  /** Spend the savings after the saving years, in withdrawals that rise with inflation. */
  drawdown: { enabled: boolean; years: number };
}

export interface PortfolioResult {
  id: PortfolioId;
  label: string;
  /** MER plus advisor fee, per year. */
  feeRate: number;
  /** At retirement, before tax. */
  balance: Money;
  /** At retirement, after tax if everything were withdrawn. */
  inHand: Money;
  /** Fees taken during the saving years. */
  feesPaid: Money;
  /** What the fees cost: the no-fee balance minus this balance (fees and the growth they would have made). */
  feeCost: Money;
  /** feeCost as a share of the no-fee balance, from 0 to 1. */
  feeCostShare: number;
  /** First monthly withdrawal after tax, then raised with inflation. Null without drawdown. */
  income: Money | null;
  /** Every withdrawal after tax, added up. Null without drawdown. */
  incomeTotal: Money | null;
  /** Fees taken during retirement. Null without drawdown. */
  feesPaidDrawdown: Money | null;
}

export interface FeesYearRow {
  year: number;
  month: number;
  /** Saving years, then retirement years. */
  phase: 'saving' | 'drawdown';
  balance: Record<PortfolioId | 'none', number>;
  /** Fees taken since the start. */
  feesPaid: Record<PortfolioId, number>;
}

export interface FeesProjection {
  input: FeesInput;
  savingMonths: number;
  drawdownMonths: number;
  /** What the person put in from their pocket. */
  deposited: Money;
  portfolios: Record<PortfolioId, PortfolioResult>;
  /** The same deposits and return with no fee at all, as a reference. */
  noFee: { balance: Money };
  /** The cheaper portfolio minus the other. Null when both cost the same. */
  gap: {
    cheaper: PortfolioId;
    inHand: Money;
    income: Money | null;
    incomeTotal: Money | null;
  } | null;
  rows: FeesYearRow[];
}
