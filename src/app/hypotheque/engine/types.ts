import type { Money } from '../../shared/engine/money';

export type PersonId = 'p1' | 'p2';

export type OptionId = 'term' | 'bank';

/** One person's own term policy. */
export interface TermPolicy {
  /** Name the person gives, shown in couple mode ("Alex", "Sam"…). */
  label: string;
  /** Paid on death, whatever the loan balance. */
  amount: number;
  /** Length of the term, from 1 to 40 years. */
  years: number;
  /** Monthly premium, fixed for the term. */
  premium: number;
}

export interface MortgageInput {
  /** A new loan, or one under way: its balance today and the years left. */
  loan: {
    amount: number;
    /** Amortization left, from 1 to 40 years. */
    years: number;
    /** Yearly posted rate, as a fraction from 0 to 0.15, compounded twice a year. */
    rate: number;
  };
  /** Two borrowers: two term policies against one bank coverage that pays at the first death. */
  couple: boolean;
  people: Record<PersonId, TermPolicy>;
  /** The bank's monthly premium, for both borrowers in couple mode. Fixed for the loan. */
  bankPremium: number;
}

/** What each option costs and covers over the years of the loan. */
export interface OptionResult {
  /** Monthly premium, both people added up in couple mode. */
  premium: Money;
  /** Every premium paid during the loan, if nobody dies. */
  premiumsPaid: Money;
}

/** When a term policy and the loan do not end together. */
export interface TermFit {
  person: PersonId;
  /** Ends first: the first loan year without coverage, and the balance then. */
  endsEarly: { year: number; balance: Money } | null;
  /** Outlasts the loan by this many years. 0 when it ends first or with the loan. */
  yearsAfter: number;
}

export interface MortgageYearRow {
  /** Loan year, from 1. */
  year: number;
  /** Owed at the start of the year: what the bank coverage pays on a death during it. */
  balance: number;
  /** Each person's term coverage during the year. */
  term: Record<PersonId, number>;
  /** Premiums paid since the start, at the end of the year. */
  premiums: { term: number; bank: number };
}

export interface MortgageProjection {
  input: MortgageInput;
  /** p1 alone, or p1 and p2. */
  people: PersonId[];
  months: number;
  payment: Money;
  term: OptionResult;
  bank: OptionResult;
  /** The dearer option's premiums during the loan minus the other's. Null when they cost the same. */
  premiumGap: { cheaper: OptionId; amount: Money } | null;
  fits: TermFit[];
  rows: MortgageYearRow[];
}

/** On a death during a given year of the loan. */
export interface DeathOutcome {
  year: number;
  person: PersonId;
  /** Owed when the death happens. */
  balance: Money;
  /** balance as a share of the loan, from 0 to 1: how far the bank's coverage has melted. */
  balanceShare: number;
  term: {
    /** Paid to the beneficiary the person chose. */
    payout: Money;
    /** Left once the loan is paid off. Null when the payout falls short. */
    free: Money | null;
    /** Still owed when the payout falls short. Null otherwise. */
    shortfall: Money | null;
    /** Couple: the survivor's own term policy, still in force. Null otherwise. */
    survivorCoverage: Money | null;
  };
  bank: {
    /** Paid to the bank: the balance. */
    payout: Money;
  };
}
