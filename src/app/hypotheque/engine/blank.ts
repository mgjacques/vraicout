import { MortgageInput, PersonId, TermPolicy } from './types';

/** A term policy as typed: a figure left empty is null. */
export interface TermPolicyForm {
  label: string;
  amount: number | null;
  years: number | null;
  premium: number | null;
}

/** The mortgage page form. Null means the person emptied the field. */
export interface MortgageForm {
  loan: { amount: number | null; years: number | null; rate: number | null };
  couple: boolean;
  people: Record<PersonId, TermPolicyForm>;
  bankPremium: number | null;
}

/** Fields without which the comparison means nothing. */
export type MortgageField =
  | 'loanAmount'
  | 'loanYears'
  | 'loanRate'
  | 'bankPremium'
  | 'termAmount1'
  | 'termYears1'
  | 'termPremium1'
  | 'termAmount2'
  | 'termYears2'
  | 'termPremium2';

/** The bank's starting premium, for one borrower or for two. */
export const DEFAULT_BANK_PREMIUM = { single: 40, couple: 70 };

/** Round figures with no source, to be replaced by the person's own: they show the effect at once. */
export function defaultMortgageForm(): MortgageForm {
  return {
    loan: { amount: 350_000, years: 25, rate: 0.045 },
    couple: false,
    people: {
      p1: { label: '', amount: 350_000, years: 25, premium: 25 },
      p2: { label: '', amount: 350_000, years: 25, premium: 22 },
    },
    bankPremium: DEFAULT_BANK_PREMIUM.single,
  };
}

export function missingMortgageFields(form: MortgageForm): MortgageField[] {
  const missing: MortgageField[] = [];
  if (!form.loan.amount) missing.push('loanAmount');
  if (!form.loan.years) missing.push('loanYears');
  if (form.loan.rate === null) missing.push('loanRate');
  if (form.bankPremium === null) missing.push('bankPremium');
  const people: [PersonId, '1' | '2'][] = form.couple
    ? [
        ['p1', '1'],
        ['p2', '2'],
      ]
    : [['p1', '1']];
  for (const [id, n] of people) {
    const policy = form.people[id];
    if (!policy.amount) missing.push(`termAmount${n}`);
    if (!policy.years) missing.push(`termYears${n}`);
    if (policy.premium === null) missing.push(`termPremium${n}`);
  }
  return missing;
}

/** Call only on a form with no missing field: what is left empty becomes 0. */
export function toMortgageInput(form: MortgageForm): MortgageInput {
  const policy = (p: TermPolicyForm): TermPolicy => ({
    label: p.label,
    amount: p.amount ?? 0,
    years: p.years ?? 0,
    premium: p.premium ?? 0,
  });
  return {
    loan: {
      amount: form.loan.amount ?? 0,
      years: form.loan.years ?? 0,
      rate: form.loan.rate ?? 0,
    },
    couple: form.couple,
    people: { p1: policy(form.people.p1), p2: policy(form.people.p2) },
    bankPremium: form.bankPremium ?? 0,
  };
}
