import { money } from '../../shared/engine/formulas';
import { Money } from '../../shared/engine/money';
import { PERIODS } from '../../shared/engine/pay';
import { PersonIncome, SplitInput, SplitResult } from './types';

/**
 * Each person's share of the couple's income. Pays are brought to a year first, so two
 * people paid on different schedules compare. A bill is split in the same proportion:
 * each pays the same share of their income. Null when both incomes are 0, which the
 * form does not let through.
 */
export function splitIncomes(input: SplitInput): SplitResult | null {
  const annual = {
    p1: annualIncome(input.people.p1),
    p2: annualIncome(input.people.p2),
  };
  const total = annual.p1.value + annual.p2.value;
  if (total <= 0) return null;

  const share = {
    p1: (annual.p1.value / total) * 100,
    p2: (annual.p2.value / total) * 100,
  };
  const rounded = Math.round(share.p1);
  const roundedFive = Math.round(share.p1 / 5) * 5;
  const bill = input.bill;
  return {
    input,
    annual,
    combined: money(total, 'formula.split.combined', {
      leftValue: annual.p1.value,
      rightValue: annual.p2.value,
    }),
    share,
    rounded: { p1: rounded, p2: 100 - rounded },
    roundedFive: { p1: roundedFive, p2: 100 - roundedFive },
    bill:
      bill === null
        ? null
        : {
            p1: billPart(bill, annual.p1.value, total, share.p1),
            p2: billPart(bill, annual.p2.value, total, share.p2),
          },
  };
}

function annualIncome(person: PersonIncome): Money {
  const periods = PERIODS[person.frequency];
  const formula = periods === 1 ? 'formula.split.annual.year' : 'formula.split.annual';
  return money(person.salary * periods, formula, { amount: person.salary, periods });
}

function billPart(bill: number, income: number, total: number, sharePercent: number): Money {
  return money((bill * sharePercent) / 100, 'formula.split.bill', {
    income,
    total,
    sharePercent,
    bill,
  });
}
