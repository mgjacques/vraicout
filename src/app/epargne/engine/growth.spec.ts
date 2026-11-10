import { describe, expect, it } from 'vitest';
import { explainMoney } from '../../shared/engine/formulas';
import { fr } from '../../shared/i18n/fr';
import { defaultSavingsForm, missingSavingsFields, SavingsForm, toSavingsInput } from './blank';
import { toMonthlyRate } from '../../shared/engine/rates';
import { projectSavings } from './growth';
import { SavingsInput } from './types';

function plan(change: Partial<SavingsInput> = {}): SavingsInput {
  return { ...toSavingsInput(defaultSavingsForm()), ...change };
}

const lookup = (key: string) => fr[key as keyof typeof fr];

describe('projectSavings', () => {
  it('grows the starting figures, then the same started ten years later', () => {
    // i = 1,06^(1/12) − 1. 240 months: 1,06^20 = 3,207135; 100 $ × 2,207135 ÷ 0,0048676 = 45 344 $.
    // Then × 1,06^25 = 4,291871: 194 610 $, for 24 000 $ deposited.
    // Started 10 years later: 120 months, 1,06^10 = 1,790848; 100 $ × 0,790848 ÷ 0,0048676 = 16 247 $,
    // × 4,291871 = 69 732 $, for 12 000 $ deposited.
    const result = projectSavings(plan());
    expect(result.totalYears).toBe(45);
    expect(result.track.deposited.value).toBe(24_000);
    expect(result.track.depositEnd?.value).toBeCloseTo(45_343.86, 2);
    expect(result.track.final.value).toBeCloseTo(194_610, 0);
    expect(result.interest.value).toBeCloseTo(170_610, 0);
    expect(result.interestShare.value).toBe(87.7);
    expect(result.late?.track.deposited.value).toBe(12_000);
    expect(result.late?.track.final.value).toBeCloseTo(69_731.5, 1);
    expect(result.late?.missed.value).toBe(12_000);
    expect(result.late?.cost.value).toBeCloseTo(124_878.5, 1);
  });

  it('reads the return as an effective yearly rate', () => {
    expect(Math.pow(1 + toMonthlyRate(0.07), 12)).toBeCloseTo(1.07, 12);
    // The case of the shared document: 92 $ for 20 years, then 45 years, at 7 %.
    const result = projectSavings(
      plan({ monthly: 92, depositYears: 20, growthYears: 45, annualReturn: 0.07, delayYears: 0 }),
    );
    expect(result.track.depositEnd?.value).toBeCloseTo(46_693, 0);
    expect(result.track.final.value).toBeCloseTo(980_680, -2);
  });

  it('gives the same balances month by month as in closed form', () => {
    for (const change of [{}, { initial: 5_000, growthYears: 0 }, { monthly: 0, initial: 1_000 }]) {
      const result = projectSavings(plan(change));
      const last = result.rows.at(-1)!;
      expect(last.year).toBe(result.totalYears);
      expect(last.balance).toBeCloseTo(result.track.final.value, 6);
      expect(last.deposited).toBeCloseTo(result.track.deposited.value, 6);
      if (result.late) expect(last.late).toBeCloseTo(result.late.track.final.value, 6);
    }
  });

  it('places the starting amount when the late start begins', () => {
    // 1 000 $ for 35 years instead of 45: 1,06^35 = 7,686087.
    const result = projectSavings(plan({ initial: 1_000, monthly: 0 }));
    expect(result.track.final.value).toBeCloseTo(1_000 * Math.pow(1.06, 45), 6);
    expect(result.late?.track.final.value).toBeCloseTo(7_686.09, 2);
    expect(result.late?.missed.value).toBe(0);
    expect(result.rows[5].late).toBe(0);
  });

  it('stops at the end of the deposits without growth years', () => {
    const result = projectSavings(plan({ growthYears: 0 }));
    expect(result.track.depositEnd).toBeNull();
    expect(result.track.final.value).toBeCloseTo(45_343.86, 2);
    expect(result.rows).toHaveLength(21);
  });

  it('has no comparison without a delay', () => {
    const result = projectSavings(plan({ delayYears: 0 }));
    expect(result.late).toBeNull();
    expect(result.rows.every((row) => row.late === null)).toBe(true);
  });

  it('earns nothing at a 0 % return', () => {
    const result = projectSavings(plan({ annualReturn: 0 }));
    expect(result.track.final.value).toBe(24_000);
    expect(result.interest.value).toBe(0);
    expect(result.interestShare.value).toBe(0);
    expect(result.late?.cost.value).toBe(12_000);
  });

  it('brings balances and deposits back to today’s dollars', () => {
    const nominal = projectSavings(plan());
    const real = projectSavings(plan({ realDollars: true, inflation: 0.02 }));
    expect(real.track.final.value).toBeCloseTo(nominal.track.final.value / Math.pow(1.02, 45), 6);
    expect(real.track.depositEnd?.value).toBeCloseTo(
      nominal.track.depositEnd!.value / Math.pow(1.02, 20),
      6,
    );
    // Each deposit is discounted from its own month: less than 24 000 $, more than at year 20.
    expect(real.track.deposited.value).toBeLessThan(24_000);
    expect(real.track.deposited.value).toBeGreaterThan(24_000 / Math.pow(1.02, 20));
    expect(real.interest.value).toBeCloseTo(real.track.final.value - real.track.deposited.value, 6);
    const last = real.rows.at(-1)!;
    expect(last.balance).toBeCloseTo(real.track.final.value, 6);
    expect(last.deposited).toBeCloseTo(real.track.deposited.value, 6);
  });

  it('explains every amount with the catalog operands', () => {
    for (const change of [
      {},
      { initial: 2_000, realDollars: true },
      { initial: 2_000, monthly: 0, growthYears: 0 },
    ]) {
      const result = projectSavings(plan(change));
      const late = result.late;
      for (const amount of [
        result.track.deposited,
        result.track.final,
        result.interest,
        result.interestShare,
        ...(result.track.depositEnd ? [result.track.depositEnd] : []),
        ...(late ? [late.track.deposited, late.track.final, late.missed, late.cost] : []),
        ...(late?.track.depositEnd ? [late.track.depositEnd] : []),
      ]) {
        expect(lookup(amount.formulaId)).toBeTruthy();
        expect(explainMoney(amount, lookup)).not.toMatch(/\{\w+\}/);
      }
    }
  });

  it('formats the monthly deposit as an amount in its formulas', () => {
    expect(explainMoney(projectSavings(plan()).track.deposited, lookup)).toBe(
      'Total versé = 100,00\u00a0$ × 240\u00a0mois = 24\u00a0000,00\u00a0$.',
    );
  });

  it('shows the same share in the formula as on the figure', () => {
    expect(explainMoney(projectSavings(plan()).interestShare, lookup)).toContain('= 87,7 %.');
  });
});

describe('missingSavingsFields', () => {
  const form = (change: Partial<SavingsForm>): SavingsForm => ({
    ...defaultSavingsForm(),
    ...change,
  });

  it('needs an amount, deposit years and a return', () => {
    expect(missingSavingsFields(defaultSavingsForm())).toEqual([]);
    expect(
      missingSavingsFields(form({ monthly: null, depositYears: null, annualReturn: null })),
    ).toEqual(['amount', 'depositYears', 'return']);
    expect(missingSavingsFields(form({ monthly: 0, initial: 500 }))).toEqual([]);
  });

  it('accepts empty optional fields as 0, but not a delay that leaves no deposit year', () => {
    expect(missingSavingsFields(form({ growthYears: null, delayYears: null }))).toEqual([]);
    expect(toSavingsInput(form({ growthYears: null, delayYears: null }))).toMatchObject({
      growthYears: 0,
      delayYears: 0,
      initial: 0,
    });
    expect(missingSavingsFields(form({ delayYears: 20 }))).toEqual(['delay']);
  });
});
