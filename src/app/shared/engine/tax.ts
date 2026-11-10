import { Account, FormulaStep } from './money';

/** Share of a capital gain that is taxed in Canada. */
export const CAPITAL_GAIN_INCLUSION = 0.5;

export interface TaxRates {
  /** Marginal rate today: RRSP refund and taxable gains. */
  taxRate: number;
  /** Marginal rate when an RRSP is withdrawn. */
  taxRateLater: number;
}

/**
 * What the person would have in hand after tax by withdrawing everything.
 * TFSA: no tax. RRSP: the whole balance is taxed at the later rate.
 * Taxable: half of the gain is taxed at today's rate (capital gain).
 * `contributed` is what reached the account; `deposited` what the person put in
 * (they differ only for an RRSP, whose refund is invested too).
 */
export function afterTax(
  account: Account,
  rates: TaxRates,
  beforeTax: number,
  contributed: number,
  deposited: number,
): { value: number; tax: FormulaStep } {
  if (account === 'rrsp') {
    const tax = beforeTax * rates.taxRateLater;
    return {
      value: beforeTax - tax,
      tax: {
        formulaId: 'formula.tax.rrsp',
        params: {
          beforeTax,
          tax,
          contributed,
          deposited,
          ratePercent: rates.taxRate * 100,
          laterPercent: rates.taxRateLater * 100,
          value: beforeTax - tax,
        },
      },
    };
  }
  if (account === 'taxable') {
    const gain = Math.max(0, beforeTax - contributed);
    const tax = gain * CAPITAL_GAIN_INCLUSION * rates.taxRate;
    return {
      value: beforeTax - tax,
      tax: {
        formulaId: 'formula.tax.taxable',
        params: { beforeTax, gain, tax, ratePercent: rates.taxRate * 100, value: beforeTax - tax },
      },
    };
  }
  return {
    value: beforeTax,
    tax: { formulaId: 'formula.tax.tfsa', params: { beforeTax, value: beforeTax } },
  };
}

/** An RRSP deposit brings a refund, invested too: each dollar puts 1 / (1 − rate) in the account. */
export function rrspGrossUp(account: Account, taxRate: number): number {
  return account === 'rrsp' ? 1 / (1 - taxRate) : 1;
}
