import { Money } from '../../shared/engine/money';
import { Frequency } from '../../shared/engine/pay';

/** A price paid once, every month or every year (a subscription, a car payment). */
export type Recurrence = 'once' | 'month' | 'year';

/** In display order. */
export const RECURRENCES: readonly Recurrence[] = ['once', 'month', 'year'];

/** GST and QST together, on a price shown before taxes. */
export const SALES_TAX = 0.14975;

/** A full-time week, spread over this many days. */
export const DAYS_PER_WEEK = 5;

/** Paid vacation included: the pay covers every week of the year. */
export const WEEKS_PER_YEAR = 52;

export interface WorkInput {
  frequency: Frequency;
  /** Net pay per period: what lands in the account. */
  salary: number;
  hoursPerWeek: number;
  /** What working costs each month (transport, parking, daycare, lunches); 0 without. */
  workCosts: number;
  price: number;
  recurrence: Recurrence;
  /** The price is before taxes: GST and QST are added. */
  addTax: boolean;
}

/** An amount of time; `value` is in hours or days, the formula says which. */
export type Duration = Money;

export interface WorkResult {
  input: WorkInput;
  /** Net pay over a year. */
  annual: Money;
  /** The year's pay minus the year's work costs; null without costs. */
  kept: Money | null;
  /** Net pay per hour worked, after work costs when there are some. */
  hourly: Money;
  /** The price as paid, taxes included when asked. */
  price: Money;
  /** Hours of work the price takes: once, per month or per year, as the price. */
  hours: Duration;
  /** The same hours in working days. */
  days: Duration;
  /** A monthly price brought to a year; null otherwise. */
  perYear: { hours: Duration; days: Duration } | null;
}
