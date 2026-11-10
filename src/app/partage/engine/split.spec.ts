import { describe, expect, it } from 'vitest';
import { explainMoney } from '../../shared/engine/formulas';
import { fr } from '../../shared/i18n/fr';
import { Frequency, withFrequency } from '../../shared/engine/pay';
import { defaultSplitForm, missingSplitFields, toSplitInput } from './blank';
import { splitIncomes } from './split';
import { PersonIncome, SplitInput } from './types';

function couple(
  p1: Partial<PersonIncome> = {},
  p2: Partial<PersonIncome> = {},
  bill: number | null = null,
): SplitInput {
  const base = toSplitInput(defaultSplitForm());
  return {
    people: { p1: { ...base.people.p1, ...p1 }, p2: { ...base.people.p2, ...p2 } },
    bill,
  };
}

const lookup = (key: string) => fr[key as keyof typeof fr];

describe('splitIncomes', () => {
  it('splits in proportion to income', () => {
    const result = splitIncomes(couple({ salary: 60_000 }, { salary: 40_000 }));
    expect(result?.share.p1).toBeCloseTo(60);
    expect(result?.share.p2).toBeCloseTo(40);
    expect(result?.rounded).toEqual({ p1: 60, p2: 40 });
    expect(result?.combined.value).toBe(100_000);
  });

  it.each<[Frequency, number]>([
    ['year', 1],
    ['month', 12],
    ['semimonth', 24],
    ['biweekly', 26],
    ['week', 52],
  ])('brings a pay received %s to a year (%i pays)', (frequency, periods) => {
    expect(splitIncomes(couple({ frequency, salary: 1_000 }))?.annual.p1.value).toBe(
      1_000 * periods,
    );
  });

  it('compares people paid on different schedules', () => {
    // 2 500 $ every two weeks is 65 000 $ a year: the same as the other person.
    const result = splitIncomes(
      couple({ frequency: 'biweekly', salary: 2_500 }, { frequency: 'year', salary: 65_000 }),
    );
    expect(result?.rounded).toEqual({ p1: 50, p2: 50 });
  });

  it('rounds to a whole percent and to the nearest 5, both adding up to 100', () => {
    // 75 000 $ and 55 000 $: 57,69 % and 42,31 %.
    const result = splitIncomes(couple());
    expect(result?.rounded).toEqual({ p1: 58, p2: 42 });
    expect(result?.roundedFive).toEqual({ p1: 60, p2: 40 });
  });

  it('splits a bill in the same proportion as income', () => {
    const result = splitIncomes(couple({ salary: 60_000 }, { salary: 40_000 }, 2_000));
    expect(result?.bill?.p1.value).toBeCloseTo(1_200);
    expect(result?.bill?.p2.value).toBeCloseTo(800);
    expect(splitIncomes(couple())?.bill).toBeNull();
  });

  it('gives the whole bill to the only income', () => {
    const result = splitIncomes(couple({ salary: 50_000 }, { salary: 0 }, 1_000));
    expect(result?.rounded).toEqual({ p1: 100, p2: 0 });
    expect(result?.bill?.p1.value).toBe(1_000);
  });

  it('does not divide by zero', () => {
    expect(splitIncomes(couple({ salary: 0 }, { salary: 0 }))).toBeNull();
  });

  it('explains every amount with the catalog operands', () => {
    const result = splitIncomes(couple({ frequency: 'week' }, { frequency: 'year' }, 1_500));
    for (const amount of [
      result!.combined,
      result!.annual.p1,
      result!.annual.p2,
      result!.bill!.p1,
      result!.bill!.p2,
    ]) {
      expect(lookup(amount.formulaId)).toBeTruthy();
      expect(explainMoney(amount, lookup)).not.toMatch(/\{\w+\}/);
    }
  });
});

describe('missingSplitFields', () => {
  it('needs both salaries, and not both at 0', () => {
    const form = defaultSplitForm();
    expect(missingSplitFields(form)).toEqual([]);
    form.people.p2.salary = null;
    expect(missingSplitFields(form)).toEqual(['salary2']);
    form.people.p1.salary = 0;
    form.people.p2.salary = 0;
    expect(missingSplitFields(form)).toEqual(['salary1', 'salary2']);
  });
});

describe('withFrequency', () => {
  it('converts the salary so the annual income stays the same', () => {
    const yearly = defaultSplitForm().people.p1;
    const biweekly = withFrequency(yearly, 'biweekly');
    expect(biweekly).toMatchObject({ frequency: 'biweekly', salary: 2_884.62 });
    // From a pay already rounded to the cent: 2 884,62 × 26 ÷ 12.
    expect(withFrequency(biweekly, 'month').salary).toBe(6_250.01);
    expect(withFrequency(biweekly, 'year').salary).toBe(75_000);
  });

  it('leaves an empty salary empty', () => {
    const empty = { ...defaultSplitForm().people.p1, salary: null };
    expect(withFrequency(empty, 'week')).toMatchObject({ frequency: 'week', salary: null });
  });
});
