import { money } from '../../shared/engine/formulas';
import { FormulaParams } from '../../shared/engine/money';
import { PERIODS } from '../../shared/engine/pay';
import { DAYS_PER_WEEK, Duration, SALES_TAX, WEEKS_PER_YEAR, WorkInput, WorkResult } from './types';

/**
 * What a price costs in hours of work: the net pay brought to an hour, after what
 * working itself costs, then the price divided by it. Null when there is no hour worked
 * or nothing left of the pay, which the form does not let through.
 */
export function hoursOfWork(input: WorkInput): WorkResult | null {
  const periods = PERIODS[input.frequency];
  const annualValue = input.salary * periods;
  const annual = money(
    annualValue,
    periods === 1 ? 'formula.hours.annual.year' : 'formula.hours.annual',
    { amount: input.salary, periods },
  );

  const keptValue = annualValue - input.workCosts * 12;
  const yearHours = input.hoursPerWeek * WEEKS_PER_YEAR;
  if (yearHours <= 0 || keptValue <= 0) return null;
  const kept =
    input.workCosts > 0
      ? money(keptValue, 'formula.hours.kept', { amount: annualValue, costs: input.workCosts })
      : null;

  const hourlyValue = keptValue / yearHours;
  const hourly = money(hourlyValue, kept ? 'formula.hours.hourly.kept' : 'formula.hours.hourly', {
    amount: keptValue,
    hoursPerWeek: input.hoursPerWeek,
    weeks: WEEKS_PER_YEAR,
  });

  const priceValue = input.addTax ? input.price * (1 + SALES_TAX) : input.price;
  const price = input.addTax
    ? money(priceValue, 'formula.hours.price.tax', {
        amount: input.price,
        taxPercent: SALES_TAX * 100,
      })
    : money(priceValue, 'formula.hours.price', {});

  const hoursValue = priceValue / hourlyValue;
  const hours = duration(hoursValue, 'formula.hours.hours', {
    price: priceValue,
    hourly: hourlyValue,
  });
  const days = toDays(hoursValue, input.hoursPerWeek);

  let perYear: WorkResult['perYear'] = null;
  if (input.recurrence === 'month') {
    const yearValue = hoursValue * 12;
    perYear = {
      hours: duration(yearValue, 'formula.hours.year', { hours: hoursValue }),
      days: toDays(yearValue, input.hoursPerWeek),
    };
  }

  return { input, annual, kept, hourly, price, hours, days, perYear };
}

function toDays(hours: number, hoursPerWeek: number): Duration {
  const perDay = hoursPerWeek / DAYS_PER_WEEK;
  return duration(hours / perDay, 'formula.hours.days', {
    hours,
    hoursPerWeek,
    daysPerWeek: DAYS_PER_WEEK,
  });
}

/** Like `money`, but the result is a count of hours or days, shown as `{result}`. */
function duration(value: number, formulaId: string, params: FormulaParams): Duration {
  return { value, formulaId, params: { ...params, result: value } };
}
