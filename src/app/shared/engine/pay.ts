/** How often a pay is received, as written on a pay slip or a contract. */
export type Frequency = 'year' | 'month' | 'semimonth' | 'biweekly' | 'week';

/** In display order. */
export const FREQUENCIES: readonly Frequency[] = ['year', 'month', 'semimonth', 'biweekly', 'week'];

/** Pays in a year: twice a month is 24, every two weeks is 26. */
export const PERIODS: Record<Frequency, number> = {
  year: 1,
  month: 12,
  semimonth: 24,
  biweekly: 26,
  week: 52,
};

/** A high income, still personal: past it, the tools stop making sense. */
export const ANNUAL_PAY_MAX = 1_000_000;

/** The highest pay per period, so a year never passes ANNUAL_PAY_MAX: 38 462 $ every two weeks. */
export function payMax(frequency: Frequency): number {
  return Math.round(ANNUAL_PAY_MAX / PERIODS[frequency]);
}

/** A pay as typed: an emptied field is null. */
export interface PayForm {
  frequency: Frequency;
  salary: number | null;
}

/**
 * A new pay frequency, with the salary converted so the annual income stays the same:
 * 75 000 $ a year becomes 2 884,62 $ every two weeks. To cents, or to the dollar for a year.
 */
export function withFrequency<T extends PayForm>(pay: T, frequency: Frequency): T {
  if (pay.salary === null) return { ...pay, frequency };
  const annual = pay.salary * PERIODS[pay.frequency];
  const salary =
    frequency === 'year'
      ? Math.round(annual)
      : Math.round((annual / PERIODS[frequency]) * 100) / 100;
  return { ...pay, frequency, salary };
}
