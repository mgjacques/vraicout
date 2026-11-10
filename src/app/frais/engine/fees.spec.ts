import { describe, expect, it } from 'vitest';
import { explainMoney } from '../../shared/engine/formulas';
import { discountFactor } from '../../shared/engine/inflation';
import { Money } from '../../shared/engine/money';
import { afterTax } from '../../shared/engine/tax';
import { fr } from '../../shared/i18n/fr';
import { defaultFeesForm, missingFeesFields, toFeesInput } from './blank';
import { firstWithdrawal, netMonthlyRate, netYearlyRate, projectFees } from './fees';
import { FeesInput } from './types';

type Overrides = Partial<Omit<FeesInput, 'portfolios' | 'drawdown'>> & {
  merA?: number;
  merB?: number;
  advisorA?: number;
  drawdown?: Partial<FeesInput['drawdown']>;
};

function quote(overrides: Overrides = {}): FeesInput {
  const base = toFeesInput(defaultFeesForm());
  const { merA, merB, advisorA, drawdown, ...rest } = overrides;
  return {
    ...base,
    ...rest,
    portfolios: {
      a: { ...base.portfolios.a, mer: merA ?? base.portfolios.a.mer, advisorFee: advisorA ?? 0 },
      b: { ...base.portfolios.b, mer: merB ?? base.portfolios.b.mer },
    },
    drawdown: { ...base.drawdown, ...drawdown },
  };
}

const lookup = (key: string) => fr[key as keyof typeof fr];

describe('projectFees', () => {
  it('gives the same result to both portfolios and the no-fee track when there is no fee', () => {
    const result = projectFees(quote({ merA: 0, merB: 0 }));
    expect(result.portfolios.a.balance.value).toBeCloseTo(result.noFee.balance.value, 6);
    expect(result.portfolios.b.balance.value).toBeCloseTo(result.noFee.balance.value, 6);
    expect(result.portfolios.a.feesPaid.value).toBe(0);
    expect(result.gap).toBeNull();
  });

  it('matches the closed form for a single deposit', () => {
    const result = projectFees(
      quote({
        initialAmount: 10_000,
        monthlyContribution: 0,
        years: 30,
        grossReturn: 0.06,
        merA: 0.02,
      }),
    );
    // Return and fees are effective yearly rates: each year multiplies by 1.06 × 0.98.
    const expected = 10_000 * Math.pow(1.06 * 0.98, 30);
    expect(result.portfolios.a.balance.value).toBeCloseTo(expected, 6);
    expect(result.noFee.balance.value).toBeCloseTo(10_000 * Math.pow(1.06, 30), 6);
  });

  it('reads the return and the fees as effective yearly rates', () => {
    const result = projectFees(
      quote({ initialAmount: 10_000, monthlyContribution: 0, years: 1, grossReturn: 0.06 }),
    );
    // 6 % entered gives exactly 10 600 $ after a year with no fee, not 10 616,78 $.
    expect(result.noFee.balance.value).toBeCloseTo(10_600, 6);
    expect(Math.pow(1 + netMonthlyRate(0.06, 0.02), 12) - 1).toBeCloseTo(
      netYearlyRate(0.06, 0.02),
      12,
    );
    expect(netYearlyRate(0.06, 0.02)).toBeCloseTo(0.0388, 12);
  });

  it('states the yearly return after fees used for the retirement income', () => {
    const result = projectFees(
      quote({ grossReturn: 0.06, merA: 0.02, drawdown: { enabled: true, years: 25 } }),
    );
    expect(result.portfolios.a.income!.params['netPercent']).toBeCloseTo(3.88, 9);
  });

  it('adds up the fees taken and measures their full cost against no fee', () => {
    const result = projectFees(quote({ monthlyContribution: 0, merA: 0.02 }));
    const a = result.portfolios.a;
    expect(a.feesPaid.value).toBeGreaterThan(0);
    // The cost includes the growth the fees would have made, so it is larger than the fees.
    expect(a.feeCost.value).toBeGreaterThan(a.feesPaid.value);
    expect(a.feeCost.value).toBeCloseTo(result.noFee.balance.value - a.balance.value, 6);
    expect(a.feeCostShare).toBeCloseTo(a.feeCost.value / result.noFee.balance.value, 9);
  });

  it('counts the advisor fee on top of the MER', () => {
    const withAdvisor = projectFees(quote({ merA: 0.01, advisorA: 0.01 }));
    const same = projectFees(quote({ merA: 0.02 }));
    expect(withAdvisor.portfolios.a.balance.value).toBeCloseTo(same.portfolios.a.balance.value, 6);
  });

  it('leaves more in the cheaper portfolio, and the gap widens with time', () => {
    const short = projectFees(quote({ years: 10 }));
    const long = projectFees(quote({ years: 30 }));
    expect(long.gap?.cheaper).toBe('b');
    expect(short.gap!.inHand.value).toBeGreaterThan(0);
    expect(long.gap!.inHand.value).toBeGreaterThan(short.gap!.inHand.value * 3);
  });

  it('taxes what is in hand the same way as the insurance tool', () => {
    for (const account of ['tfsa', 'rrsp', 'taxable'] as const) {
      const input = quote({ account, taxRate: 0.4, taxRateLater: 0.3, merA: 0.02 });
      const result = projectFees(input);
      const grossUp = account === 'rrsp' ? 1 / 0.6 : 1;
      const deposited = input.initialAmount + input.monthlyContribution * input.years * 12;
      const expected = afterTax(
        account,
        input,
        result.portfolios.a.balance.value,
        deposited * grossUp,
        deposited,
      );
      expect(result.portfolios.a.inHand.value).toBeCloseTo(expected.value, 6);
    }
  });

  it('invests the RRSP refund of every deposit', () => {
    const tfsa = projectFees(quote({ account: 'tfsa' }));
    const rrsp = projectFees(quote({ account: 'rrsp', taxRate: 0.4 }));
    expect(rrsp.portfolios.a.balance.value).toBeCloseTo(tfsa.portfolios.a.balance.value / 0.6, 4);
  });

  it('brings a balance back to today’s dollars from its month', () => {
    const nominal = projectFees(quote({ realDollars: false }));
    const real = projectFees(quote({ realDollars: true, inflation: 0.025 }));
    const factor = discountFactor(0.025, nominal.savingMonths);
    expect(real.portfolios.a.balance.value).toBeCloseTo(
      nominal.portfolios.a.balance.value * factor,
      6,
    );
    expect(real.portfolios.a.feesPaid.value).toBeLessThan(nominal.portfolios.a.feesPaid.value);
    expect(real.portfolios.a.feesPaid.value).toBeGreaterThan(
      nominal.portfolios.a.feesPaid.value * factor,
    );
  });

  it('empties each portfolio at the last month of retirement', () => {
    const result = projectFees(quote({ drawdown: { enabled: true, years: 25 } }));
    const last = result.rows[result.rows.length - 1];
    expect(last.phase).toBe('drawdown');
    expect(last.year).toBe(30 + 25);
    expect(last.balance.a).toBeCloseTo(0, 4);
    expect(last.balance.b).toBeCloseTo(0, 4);
    expect(last.balance.none).toBeCloseTo(0, 4);
    expect(result.gap!.income!.value).toBeGreaterThan(0);
    expect(result.portfolios.a.feesPaidDrawdown!.value).toBeGreaterThan(0);
  });

  it('keeps the same buying power in retirement: the first withdrawal in today’s dollars is the income', () => {
    const balance = 500_000;
    const rate = netMonthlyRate(0.05, 0.01);
    const index = Math.pow(1.02, 1 / 12) - 1;
    const first = firstWithdrawal(balance, rate, index, 300);
    let value = balance;
    for (let k = 1; k <= 300; k++) value = value * (1 + rate) - first * Math.pow(1 + index, k - 1);
    expect(value).toBeCloseTo(0, 4);
    expect(firstWithdrawal(1200, 0, 0, 12)).toBeCloseTo(100, 9);
  });

  it('has no retirement amounts when the drawdown is off', () => {
    const result = projectFees(quote({ drawdown: { enabled: false } }));
    expect(result.portfolios.a.income).toBeNull();
    expect(result.gap!.income).toBeNull();
    expect(result.rows.every((row) => row.phase === 'saving')).toBe(true);
    expect(result.rows.length).toBe(31);
  });

  it('clamps values out of range', () => {
    const result = projectFees(quote({ merA: 0.5, grossReturn: 2, years: 500 }));
    expect(result.portfolios.a.feeRate).toBe(0.05);
    expect(result.input.grossReturn).toBe(0.15);
    expect(result.input.years).toBe(60);
  });

  it('explains every amount with the catalog operands', () => {
    for (const account of ['tfsa', 'rrsp', 'taxable'] as const) {
      for (const realDollars of [false, true]) {
        const result = projectFees(quote({ account, realDollars, drawdown: { enabled: true } }));
        const amounts: Money[] = [result.deposited, result.noFee.balance];
        for (const p of [result.portfolios.a, result.portfolios.b]) {
          amounts.push(p.balance, p.inHand, p.feesPaid, p.feeCost);
          amounts.push(p.income!, p.incomeTotal!, p.feesPaidDrawdown!);
        }
        amounts.push(result.gap!.inHand, result.gap!.income!, result.gap!.incomeTotal!);
        for (const amount of amounts) {
          for (const id of [amount.formulaId, ...(amount.steps ?? []).map((s) => s.formulaId)]) {
            expect(fr).toHaveProperty(id);
          }
          const text = explainMoney(amount, lookup);
          expect(text).not.toMatch(/\{\w+\}/);
          const tokens = [amount, ...(amount.steps ?? [])].flatMap((part) =>
            [...lookup(part.formulaId)!.matchAll(/\{(\w+)\}/g)].map((m) => [m[1], part.params]),
          );
          for (const [token, params] of tokens) expect(params).toHaveProperty(token as string);
        }
      }
    }
  });
});

describe('fees form', () => {
  it('starts complete and names what an emptied field leaves missing', () => {
    const form = defaultFeesForm();
    expect(missingFeesFields(form)).toEqual([]);
    form.initialAmount = null;
    form.monthlyContribution = 0;
    form.portfolios.b.mer = null;
    expect(missingFeesFields(form)).toEqual(['amount', 'merB']);
  });

  it('turns an empty advisor fee into 0', () => {
    const form = defaultFeesForm();
    form.portfolios.a.advisorFee = null;
    expect(toFeesInput(form).portfolios.a.advisorFee).toBe(0);
  });
});
