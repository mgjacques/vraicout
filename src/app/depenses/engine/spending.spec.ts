import { describe, expect, it } from 'vitest';
import { explainMoney } from '../../shared/engine/formulas';
import { fr } from '../../shared/i18n/fr';
import { defaultSpendingForm, missingSpendingFields, SpendingForm, toSpendingInput } from './blank';
import { spendingCost } from './spending';
import { Cadence, CADENCES, SpendingInput } from './types';

function spend(change: Partial<SpendingInput> = {}): SpendingInput {
  return { ...toSpendingInput(defaultSpendingForm()), ...change };
}

const lookup = (key: string) => fr[key as keyof typeof fr];

describe('spendingCost', () => {
  it('brings a coffee on each workday to a year, ten years and an investment', () => {
    // 5 × 52 = 260 times; 5 $ × 260 = 1 300 $ a year; × 10 = 13 000 $.
    // (1,07)^(1/12) − 1 = 0,5654 % a month; 108,33 $ × ((1 + i)^120 − 1) ÷ i = 18 530,60 $.
    const result = spendingCost(spend());
    expect(result.timesPerYear).toBe(260);
    expect(result.perYear.value).toBe(1_300);
    expect(result.total.value).toBe(13_000);
    expect(result.invested.value).toBeCloseTo(18_530.6, 1);
    expect(result.interest.value).toBeCloseTo(5_530.6, 1);
  });

  it.each<[Cadence, number]>([
    ['perDay', 3 * 365],
    ['everyDays', 365 / 3],
    ['perWeek', 3 * 52],
    ['everyWeeks', 52 / 3],
    ['perMonth', 3 * 12],
    ['everyMonths', 12 / 3],
  ])('counts %s with X = 3', (cadence, times) => {
    const result = spendingCost(spend({ cadence, count: 3, amount: 10 }));
    expect(result.timesPerYear).toBeCloseTo(times, 10);
    expect(result.perYear.value).toBeCloseTo(10 * times, 10);
  });

  it('matches the closed formula without price growth', () => {
    const i = Math.pow(1.07, 1 / 12) - 1;
    const closed = (1_300 / 12) * ((Math.pow(1 + i, 120) - 1) / i);
    expect(spendingCost(spend()).invested.value).toBeCloseTo(closed, 6);
  });

  it('raises the price once a year with price growth', () => {
    // 1 300 $ × (1,02^10 − 1) ÷ 0,02 = 14 234,64 $.
    const result = spendingCost(spend({ priceGrowth: true }));
    expect(result.perYear.value).toBe(1_300);
    expect(result.total.value).toBeCloseTo(14_234.64, 2);
    expect(result.invested.value).toBeGreaterThan(18_530.6);
    expect(result.interest.value).toBeCloseTo(result.invested.value - result.total.value, 6);
  });

  it('ignores the inflation rate while the box is off', () => {
    expect(spendingCost(spend({ inflation: 0.05 })).total.value).toBe(13_000);
  });

  it('earns no interest at 0 %', () => {
    const result = spendingCost(spend({ annualReturn: 0, priceGrowth: true }));
    expect(result.invested.value).toBeCloseTo(result.total.value, 6);
    expect(result.interest.value).toBeCloseTo(0, 6);
  });

  it('gives zero everywhere for a free spending', () => {
    const result = spendingCost(spend({ amount: 0 }));
    expect(
      [result.perYear, result.total, result.invested, result.interest].map((m) => m.value),
    ).toEqual([0, 0, 0, 0]);
  });

  it('explains every amount with the catalog operands', () => {
    for (const cadence of CADENCES) {
      for (const priceGrowth of [false, true]) {
        const result = spendingCost(spend({ cadence, priceGrowth }));
        for (const amount of [result.perYear, result.total, result.invested, result.interest]) {
          expect(lookup(amount.formulaId)).toBeTruthy();
          expect(explainMoney(amount, lookup)).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });

  it('shows the figures of the calculation in its sentences', () => {
    const result = spendingCost(spend());
    expect(explainMoney(result.perYear, lookup)).toContain('5,00 $ × 5 fois par semaine × 52');
    expect(explainMoney(result.invested, lookup)).toContain('108,33 $');
    expect(explainMoney(result.invested, lookup)).toContain('7 %');
  });
});

describe('missingSpendingFields', () => {
  const form = (change: Partial<SpendingForm>): SpendingForm => ({
    ...defaultSpendingForm(),
    ...change,
  });

  it('needs an amount, a count, years and a return', () => {
    expect(missingSpendingFields(defaultSpendingForm())).toEqual([]);
    expect(
      missingSpendingFields(form({ amount: null, count: 0, years: null, annualReturn: null })),
    ).toEqual(['amount', 'count', 'years', 'return']);
  });

  it('accepts an amount and a return of 0', () => {
    expect(missingSpendingFields(form({ amount: 0, annualReturn: 0 }))).toEqual([]);
  });
});
