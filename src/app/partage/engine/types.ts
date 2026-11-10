import { Money } from '../../shared/engine/money';
import { Frequency } from '../../shared/engine/pay';

export type PersonId = 'p1' | 'p2';

export interface PersonIncome {
  label: string;
  frequency: Frequency;
  /** Pay per period, gross or net: the person picks, the same for both. */
  salary: number;
}

export interface SplitInput {
  people: Record<PersonId, PersonIncome>;
  /** An expense to split; null when not entered. */
  bill: number | null;
}

export interface SplitResult {
  input: SplitInput;
  annual: Record<PersonId, Money>;
  /** Both annual incomes added up. */
  combined: Money;
  /** Each person's share of the couple's income, in percent. The two add up to 100. */
  share: Record<PersonId, number>;
  /** The shares rounded to a whole percent, still adding up to 100. */
  rounded: Record<PersonId, number>;
  /** The shares rounded to the nearest 5, as a split is often said: 60/40. */
  roundedFive: Record<PersonId, number>;
  /** Each person's part of the bill; null without a bill. */
  bill: Record<PersonId, Money> | null;
}
