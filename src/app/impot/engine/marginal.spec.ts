import { describe, expect, it } from 'vitest';
import { explainMoney } from '../../shared/engine/formulas';
import { Money } from '../../shared/engine/money';
import { fr } from '../../shared/i18n/fr';
import { defaultMarginalForm, missingMarginalFields, toMarginalInput } from './blank';
import { bracketTax, federalBasicAmount, FEDERAL_BRACKETS, rateThresholds } from './brackets';
import { CHART_MAX, marginalRate, totalTax } from './marginal';
import { MarginalInput, MarginalResult } from './types';

function rate(change: Partial<MarginalInput> = {}): MarginalResult {
  return marginalRate({ ...toMarginalInput(defaultMarginalForm()), ...change });
}

const lookup = (key: string) => fr[key as keyof typeof fr];

describe('marginalRate', () => {
  it('gives the rate on the next dollar and the tax of the starting figures', () => {
    // Québec: 54 345 $ × 14 % + 15 655 $ × 19 % = 10 582,75 $; − 14 % × 18 952 $ = 7 929,47 $.
    // Federal: 58 523 $ × 14 % + 11 477 $ × 20,5 % = 10 546,005 $; − 14 % × 16 452 $
    // = 8 242,725 $; × (1 − 16,5 %) = 6 882,675 $. Total 14 812,15 $, 21,16 % of 70 000 $.
    // Next dollar: 20,5 % × 0,835 = 17,1175 % + 19 % = 36,1175 %.
    const result = rate({ extra: 0 });
    expect(result.quebec.tax.value).toBeCloseTo(7_929.47, 2);
    expect(result.federal.tax.value).toBeCloseTo(6_882.675, 3);
    expect(result.total.value).toBeCloseTo(14_812.145, 3);
    expect(result.average.value).toBeCloseTo(21.16, 2);
    expect(result.federal.rate.value).toBeCloseTo(17.1175, 4);
    expect(result.quebec.rate.value).toBeCloseTo(19, 6);
    expect(result.marginal.value).toBeCloseTo(36.1175, 4);
    expect(result.extra).toBeNull();
  });

  it.each<[number, number]>([
    [10_000, 0],
    [17_000, 11.69],
    [30_000, 25.69],
    [56_000, 30.69],
    [70_000, 36.1175],
    [110_000, 41.1175],
    [120_000, 45.71],
    [150_000, 47.46],
    [200_000, 50.2113],
    [300_000, 53.305],
  ])('taxes the dollar after %i $ at %f %%', (income, percent) => {
    expect(rate({ income }).marginal.value).toBeCloseTo(percent, 3);
  });

  it('takes the bracket above at a threshold', () => {
    expect(rate({ income: 58_522 }).federal.rate.value).toBeCloseTo(11.69, 4);
    expect(rate({ income: 58_523 }).federal.rate.value).toBeCloseTo(17.1175, 4);
    expect(rate({ income: 54_345 }).quebec.rate.value).toBeCloseTo(19, 6);
  });

  it('starts each level’s rate where its basic personal amount runs out', () => {
    expect(rate({ income: 16_451 }).federal.rate.value).toBe(0);
    expect(rate({ income: 16_452 }).federal.rate.value).toBeCloseTo(11.69, 4);
    expect(rate({ income: 18_951 }).quebec.rate.value).toBe(0);
    expect(rate({ income: 18_952 }).quebec.rate.value).toBeCloseTo(14, 6);
    expect(rate({ income: 16_000 }).total.value).toBe(0);
  });

  it('adds the loss of the federal basic amount between the fourth and fifth brackets', () => {
    // Halfway: 14 829 $ + 1 623 $ × ½ = 15 640,50 $.
    expect(federalBasicAmount(219_961)).toBeCloseTo(15_640.5, 6);
    expect(federalBasicAmount(100_000)).toBe(16_452);
    expect(federalBasicAmount(400_000)).toBe(14_829);
    // (29 % + 14 % × 1 623 $ ÷ 77 042 $) × 0,835 = 24,4613 %.
    const result = rate({ income: 200_000 });
    expect(result.federal.rate.value).toBeCloseTo(24.4613, 4);
    expect(result.federal.rate.formulaId).toBe('formula.marginal.federalRate.phase');
  });

  it('matches the rate with the tax a dollar more adds', () => {
    for (const income of [20_000, 70_000, 125_000, 200_000, 400_000]) {
      const added = (totalTax(income + 1) - totalTax(income)) * 100;
      expect(rate({ income }).marginal.value).toBeCloseTo(added, 3);
    }
  });

  it('taxes the extra income between two rates when it crosses a threshold', () => {
    // 105 000 $ + 10 000 $ crosses 108 680 $: 3 680 $ at 36,12 %, 6 320 $ at 41,12 %.
    const extra = rate({ income: 105_000, extra: 10_000 }).extra!;
    expect(extra.tax.value).toBeCloseTo(3_680 * 0.361175 + 6_320 * 0.411175, 2);
    expect(extra.kept.value).toBeCloseTo(10_000 - extra.tax.value, 6);
    expect(extra.rate.value).toBeGreaterThan(36.1175);
    expect(extra.rate.value).toBeLessThan(41.1175);
  });

  it('keeps 63,88 % of a raise inside the bracket', () => {
    const extra = rate().extra!;
    expect(extra.tax.value).toBeCloseTo(1_805.875, 3);
    expect(extra.kept.value).toBeCloseTo(3_194.125, 3);
    expect(extra.rate.value).toBeCloseTo(36.1175, 4);
  });

  it('gives no tax and no average rate without income', () => {
    const result = rate({ income: 0 });
    expect(result.total.value).toBe(0);
    expect(result.average.value).toBe(0);
    expect(result.marginal.value).toBe(0);
    expect(result.average.formulaId).toBe('formula.marginal.average.zero');
  });

  it('draws the chart with the same rate as an entered income', () => {
    const steps = rate().steps;
    expect(steps[0]).toEqual({ from: 0, federalPercent: 0, quebecPercent: 0, percent: 0 });
    expect(steps).toHaveLength(10);
    expect(steps.every((step) => step.from < CHART_MAX)).toBe(true);
    for (const step of steps) {
      expect(rate({ income: step.from }).marginal.value).toBeCloseTo(step.percent, 10);
    }
    expect(steps.at(-1)?.percent).toBeCloseTo(53.305, 3);
    expect(rateThresholds()).toContain(132_245);
  });

  it('adds the brackets up to the income', () => {
    expect(bracketTax(0, FEDERAL_BRACKETS)).toBe(0);
    expect(bracketTax(117_045, FEDERAL_BRACKETS)).toBeCloseTo(58_523 * 0.14 + 58_522 * 0.205, 6);
  });

  it('explains every amount with the catalog operands', () => {
    for (const income of [0, 17_000, 70_000, 200_000, 400_000]) {
      const result = rate({ income, extra: 2_500 });
      const amounts: Money[] = [
        result.federal.rate,
        result.federal.tax,
        result.quebec.rate,
        result.quebec.tax,
        result.marginal,
        result.total,
        result.average,
        ...(result.extra ? [result.extra.tax, result.extra.kept, result.extra.rate] : []),
      ];
      for (const amount of amounts) {
        expect(lookup(amount.formulaId)).toBeTruthy();
        expect(explainMoney(amount, lookup)).not.toMatch(/\{\w+\}/);
      }
    }
  });

  it('shows the same rate in the formula as on the figure', () => {
    const result = rate();
    expect(explainMoney(result.marginal, lookup)).toContain('= 36,12 %.');
    expect(explainMoney(result.federal.tax, lookup)).toContain('= 6 882,68 $.');
  });
});

describe('missingMarginalFields', () => {
  it('needs only the income', () => {
    expect(missingMarginalFields(defaultMarginalForm())).toEqual([]);
    expect(missingMarginalFields({ income: 0, extra: null })).toEqual([]);
    expect(missingMarginalFields({ income: null, extra: 5_000 })).toEqual(['income']);
  });
});
