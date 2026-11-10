import { MarginalInput } from './types';

/** The marginal rate page form. Null means the person emptied the field. */
export interface MarginalForm {
  income: number | null;
  extra: number | null;
}

/** Only the income is required; an empty extra means none. */
export type MarginalField = 'income';

/** A common salary and a raise, so the first screen already says something. */
export function defaultMarginalForm(): MarginalForm {
  return { income: 70_000, extra: 5_000 };
}

/** An income of 0 is allowed: it pays no tax. */
export function missingMarginalFields(form: MarginalForm): MarginalField[] {
  return form.income === null ? ['income'] : [];
}

/** Call only on a form with no missing field. */
export function toMarginalInput(form: MarginalForm): MarginalInput {
  return { income: form.income ?? 0, extra: form.extra ?? 0 };
}
