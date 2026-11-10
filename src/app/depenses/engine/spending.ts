import { money } from '../../shared/engine/formulas';
import { toMonthlyRate } from '../../shared/engine/rates';
import { isTimesPer, PERIODS_PER_YEAR, SpendingInput, SpendingResult } from './types';

/**
 * A spending that comes back often, brought to a year, then over the years; and what
 * the same sums would be worth if they had been invested instead, deposited monthly.
 */
export function spendingCost(input: SpendingInput): SpendingResult {
  const periods = PERIODS_PER_YEAR[input.cadence];
  const timesPerYear = isTimesPer(input.cadence) ? input.count * periods : periods / input.count;

  const perYearValue = input.amount * timesPerYear;
  const perYear = money(perYearValue, `formula.spending.perYear.${input.cadence}`, {
    amount: input.amount,
    count: input.count,
    periods,
  });

  // Prices rise once a year, at the start of each new year.
  const growth = input.priceGrowth ? input.inflation : 0;
  const yearCost = (year: number) => perYearValue * Math.pow(1 + growth, year - 1);

  const totalValue =
    growth > 0
      ? (perYearValue * (Math.pow(1 + growth, input.years) - 1)) / growth
      : perYearValue * input.years;
  const total =
    growth > 0
      ? money(totalValue, 'formula.spending.total.growth', {
          amount: perYearValue,
          years: input.years,
          inflationPercent: growth * 100,
        })
      : money(totalValue, 'formula.spending.total', {
          amount: perYearValue,
          years: input.years,
        });

  // Each month: interest first, then a twelfth of the current year's cost.
  const rate = toMonthlyRate(input.annualReturn);
  const months = input.years * 12;
  let balance = 0;
  for (let month = 1; month <= months; month++) {
    balance = balance * (1 + rate) + yearCost(Math.ceil(month / 12)) / 12;
  }
  const invested = money(
    balance,
    growth > 0 ? 'formula.spending.invested.growth' : 'formula.spending.invested',
    {
      depositMonthly: perYearValue / 12,
      months,
      ratePercent: input.annualReturn * 100,
      ...(growth > 0 ? { inflationPercent: growth * 100 } : {}),
    },
  );

  const interest = money(balance - totalValue, 'formula.spending.interest', {
    balance,
    deposited: totalValue,
  });

  return { input, timesPerYear, perYear, total, invested, interest };
}
