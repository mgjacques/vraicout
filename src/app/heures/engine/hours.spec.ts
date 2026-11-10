import { describe, expect, it } from 'vitest';
import { explainMoney } from '../../shared/engine/formulas';
import { Frequency } from '../../shared/engine/pay';
import { fr } from '../../shared/i18n/fr';
import { defaultWorkForm, missingWorkFields, toWorkInput, WorkForm } from './blank';
import { hoursOfWork } from './hours';
import { WorkInput } from './types';

function work(change: Partial<WorkInput> = {}): WorkInput {
  return { ...toWorkInput(defaultWorkForm()), ...change };
}

const lookup = (key: string) => fr[key as keyof typeof fr];

describe('hoursOfWork', () => {
  it('turns a price into hours and days of work', () => {
    // 2 000 $ × 26 = 52 000 $; ÷ (37,5 h × 52) = 26,67 $/h.
    // 1 400 $ × 1,14975 = 1 609,65 $; ÷ 26,67 $ = 60,36 h; ÷ 7,5 h a day = 8,05 days.
    const result = hoursOfWork(work())!;
    expect(result.annual.value).toBe(52_000);
    expect(result.hourly.value).toBeCloseTo(26.667, 3);
    expect(result.price.value).toBeCloseTo(1_609.65, 2);
    expect(result.hours.value).toBeCloseTo(60.36, 2);
    expect(result.days.value).toBeCloseTo(8.05, 2);
    expect(result.kept).toBeNull();
    expect(result.perYear).toBeNull();
  });

  it.each<[Frequency, number]>([
    ['year', 1],
    ['month', 12],
    ['semimonth', 24],
    ['biweekly', 26],
    ['week', 52],
  ])('brings a pay received %s to a year (%i pays)', (frequency, periods) => {
    expect(hoursOfWork(work({ frequency, salary: 1_000 }))?.annual.value).toBe(1_000 * periods);
  });

  it('leaves the price as typed without taxes', () => {
    const result = hoursOfWork(work({ addTax: false, price: 1_000 }))!;
    expect(result.price.value).toBe(1_000);
    expect(result.hours.value).toBeCloseTo(37.5);
  });

  it('takes work costs off the pay first', () => {
    // 52 000 $ − 500 $ × 12 = 46 000 $; ÷ 1 950 h = 23,59 $/h.
    const result = hoursOfWork(work({ workCosts: 500, addTax: false, price: 1_000 }))!;
    expect(result.kept?.value).toBe(46_000);
    expect(result.hourly.value).toBeCloseTo(23.59, 2);
    expect(result.hours.value).toBeCloseTo(42.39, 2);
  });

  it('brings a monthly price to a year', () => {
    const result = hoursOfWork(work({ recurrence: 'month', price: 100, addTax: false }))!;
    expect(result.hours.value).toBeCloseTo(3.75);
    expect(result.perYear?.hours.value).toBeCloseTo(45);
    expect(result.perYear?.days.value).toBeCloseTo(6);
  });

  it('gives a yearly price in hours per year, with no second line', () => {
    expect(hoursOfWork(work({ recurrence: 'year' }))?.perYear).toBeNull();
  });

  it('does not divide by zero', () => {
    expect(hoursOfWork(work({ hoursPerWeek: 0 }))).toBeNull();
    expect(hoursOfWork(work({ salary: 0 }))).toBeNull();
    expect(hoursOfWork(work({ workCosts: 10_000 }))).toBeNull();
  });

  it('explains every amount with the catalog operands', () => {
    for (const change of [{}, { workCosts: 300, recurrence: 'month' as const, addTax: false }]) {
      const result = hoursOfWork(work({ frequency: 'year', salary: 52_000, ...change }))!;
      for (const amount of [
        result.annual,
        result.hourly,
        result.price,
        result.hours,
        result.days,
        ...(result.kept ? [result.kept] : []),
        ...(result.perYear ? [result.perYear.hours, result.perYear.days] : []),
      ]) {
        expect(lookup(amount.formulaId)).toBeTruthy();
        expect(explainMoney(amount, lookup)).not.toMatch(/\{\w+\}/);
      }
    }
  });

  it('shows the same hours in the formula as on the figure', () => {
    const hours = hoursOfWork(work())!.hours;
    expect(explainMoney(hours, lookup)).toContain('= 60,4 h.');
  });
});

describe('missingWorkFields', () => {
  const form = (change: Partial<WorkForm>): WorkForm => ({ ...defaultWorkForm(), ...change });

  it('needs a pay, hours and a price', () => {
    expect(missingWorkFields(defaultWorkForm())).toEqual([]);
    expect(missingWorkFields(form({ salary: null, hoursPerWeek: 0, price: null }))).toEqual([
      'salary',
      'hoursPerWeek',
      'price',
    ]);
  });

  it('accepts a price of 0 but not work costs that eat the whole pay', () => {
    expect(missingWorkFields(form({ price: 0 }))).toEqual([]);
    // 2 000 $ × 26 = 52 000 $ a year; 4 400 $ × 12 = 52 800 $.
    expect(missingWorkFields(form({ workCosts: 4_400 }))).toEqual(['workCosts']);
  });
});
