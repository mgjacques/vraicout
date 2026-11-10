import { SavingsInput } from './types';

/** The savings page form. Null means the person emptied the field. */
export interface SavingsForm {
  initial: number | null;
  monthly: number | null;
  depositYears: number | null;
  growthYears: number | null;
  annualReturn: number | null;
  delayYears: number | null;
  realDollars: boolean;
  inflation: number;
}

/** Fields without which the projection means nothing; `delay` when it leaves no deposit year. */
export type SavingsField = 'amount' | 'depositYears' | 'return' | 'delay';

/** Saving from 25 to 45, then letting it grow to 65; the same started at 35. */
export function defaultSavingsForm(): SavingsForm {
  return {
    initial: null,
    monthly: 100,
    depositYears: 20,
    growthYears: 25,
    annualReturn: 0.06,
    delayYears: 10,
    realDollars: false,
    inflation: 0.02,
  };
}

export function missingSavingsFields(form: SavingsForm): SavingsField[] {
  const missing: SavingsField[] = [];
  if (!form.initial && !form.monthly) missing.push('amount');
  if (!form.depositYears) missing.push('depositYears');
  if (form.annualReturn === null) missing.push('return');
  if (form.depositYears && form.delayYears && form.delayYears >= form.depositYears) {
    missing.push('delay');
  }
  return missing;
}

/** Empty optional fields become 0. Call only on a form with no missing field. */
export function toSavingsInput(form: SavingsForm): SavingsInput {
  return {
    initial: form.initial ?? 0,
    monthly: form.monthly ?? 0,
    depositYears: form.depositYears ?? 0,
    growthYears: form.growthYears ?? 0,
    annualReturn: form.annualReturn ?? 0,
    delayYears: form.delayYears ?? 0,
    realDollars: form.realDollars,
    inflation: form.inflation,
  };
}
