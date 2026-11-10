import { Money } from '../../shared/engine/money';

export interface SavingsInput {
  /** Placed at month 0; 0 without. */
  initial: number;
  /** Deposited at the end of each month of the deposit years. */
  monthly: number;
  depositYears: number;
  /** Years left to grow after the last deposit; 0 without. */
  growthYears: number;
  /** Effective yearly rate: 0.06 grows 1 $ to exactly 1,06 $ in twelve months. */
  annualReturn: number;
  /** The same savings started this many years later; 0 for no comparison. Below `depositYears`. */
  delayYears: number;
  realDollars: boolean;
  inflation: number;
}

/** One way to save: how much went in, the balance once deposits stop, then at the end. */
export interface SavingsTrack {
  deposited: Money;
  /** Null when deposits run to the end. */
  depositEnd: Money | null;
  final: Money;
}

/** One point of the chart, at the end of each year. */
export interface SavingsYearRow {
  year: number;
  deposited: number;
  balance: number;
  /** The late start's balance; null without a comparison. */
  late: number | null;
}

export interface SavingsProjection {
  input: SavingsInput;
  /** The effective yearly rate as a monthly one. */
  monthlyRate: number;
  totalYears: number;
  track: SavingsTrack;
  /** What the balance holds beyond the deposits. */
  interest: Money;
  /** The interest's share of the final balance, in percent to one decimal. */
  interestShare: Money;
  late: {
    track: SavingsTrack;
    /** Deposits the late start never makes. */
    missed: Money;
    /** Final balance minus the late start's. */
    cost: Money;
  } | null;
  rows: SavingsYearRow[];
}
