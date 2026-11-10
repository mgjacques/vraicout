import { Cadence, SpendingInput } from './types';

/** The spending page form. Null means the person emptied the field. */
export interface SpendingForm {
  amount: number | null;
  count: number | null;
  cadence: Cadence;
  years: number | null;
  annualReturn: number | null;
  priceGrowth: boolean;
  inflation: number;
}

export type SpendingField = 'amount' | 'count' | 'years' | 'return';

/** A coffee on each workday, over ten years: the first screen already says something. */
export function defaultSpendingForm(): SpendingForm {
  return {
    amount: 5,
    count: 5,
    cadence: 'perWeek',
    years: 10,
    annualReturn: 0.07,
    priceGrowth: false,
    inflation: 0.02,
  };
}

/** An amount of 0 is allowed; a count or years of 0 are not. */
export function missingSpendingFields(form: SpendingForm): SpendingField[] {
  const missing: SpendingField[] = [];
  if (form.amount === null) missing.push('amount');
  if (!form.count) missing.push('count');
  if (!form.years) missing.push('years');
  if (form.annualReturn === null) missing.push('return');
  return missing;
}

/** Call only on a form with no missing field. */
export function toSpendingInput(form: SpendingForm): SpendingInput {
  return {
    amount: form.amount ?? 0,
    count: form.count ?? 1,
    cadence: form.cadence,
    years: form.years ?? 1,
    annualReturn: form.annualReturn ?? 0,
    priceGrowth: form.priceGrowth,
    inflation: form.inflation,
  };
}
