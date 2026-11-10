import { FeesInput, FeeSet, PortfolioId } from './types';

/** A portfolio as typed: a rate left empty is null. */
export interface FeeSetForm {
  label: string;
  mer: number | null;
  advisorFee: number | null;
}

/** The fees page form. Null means the person emptied the field. */
export interface FeesForm extends Omit<
  FeesInput,
  'initialAmount' | 'monthlyContribution' | 'years' | 'grossReturn' | 'portfolios' | 'drawdown'
> {
  initialAmount: number | null;
  monthlyContribution: number | null;
  years: number | null;
  grossReturn: number | null;
  portfolios: Record<PortfolioId, FeeSetForm>;
  drawdown: { enabled: boolean; years: number | null };
}

/** Fields without which the comparison means nothing. */
export type FeesField = 'amount' | 'years' | 'return' | 'merA' | 'merB' | 'drawdownYears';

/** Round figures that show the effect at once: a mutual fund against an index ETF. */
export function defaultFeesForm(): FeesForm {
  return {
    initialAmount: 10_000,
    monthlyContribution: 300,
    years: 30,
    grossReturn: 0.06,
    portfolios: {
      a: { label: 'Fonds commun', mer: 0.022, advisorFee: 0 },
      b: { label: 'FNB indiciel', mer: 0.0025, advisorFee: 0 },
    },
    account: 'tfsa',
    taxRate: 0.3,
    taxRateLater: 0.3,
    realDollars: false,
    inflation: 0.02,
    drawdown: { enabled: false, years: 25 },
  };
}

export function missingFeesFields(form: FeesForm): FeesField[] {
  const missing: FeesField[] = [];
  if (!form.initialAmount && !form.monthlyContribution) missing.push('amount');
  if (!form.years) missing.push('years');
  if (form.grossReturn === null) missing.push('return');
  if (form.portfolios.a.mer === null) missing.push('merA');
  if (form.portfolios.b.mer === null) missing.push('merB');
  if (form.drawdown.enabled && !form.drawdown.years) missing.push('drawdownYears');
  return missing;
}

/** Empty optional fields become 0. Call only on a form with no missing field. */
export function toFeesInput(form: FeesForm): FeesInput {
  const fees = (set: FeeSetForm): FeeSet => ({
    label: set.label,
    mer: set.mer ?? 0,
    advisorFee: set.advisorFee ?? 0,
  });
  return {
    ...form,
    initialAmount: form.initialAmount ?? 0,
    monthlyContribution: form.monthlyContribution ?? 0,
    years: form.years ?? 0,
    grossReturn: form.grossReturn ?? 0,
    portfolios: { a: fees(form.portfolios.a), b: fees(form.portfolios.b) },
    drawdown: { enabled: form.drawdown.enabled, years: form.drawdown.years ?? 0 },
  };
}
