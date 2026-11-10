import { money } from '../../shared/engine/formulas';
import { discountFactor, presentValueFactor } from '../../shared/engine/inflation';
import { Money } from '../../shared/engine/money';
import { toMonthlyRate } from '../../shared/engine/rates';
import { SavingsInput, SavingsProjection, SavingsTrack, SavingsYearRow } from './types';

/**
 * One savings plan month by month, then the same plan started later: interest first, then
 * the deposit, at the monthly rate equivalent to the effective yearly return. Both plans stop
 * depositing on the same day and end on the same day.
 */
export function projectSavings(input: SavingsInput): SavingsProjection {
  const monthlyRate = toMonthlyRate(input.annualReturn);
  const depositMonths = input.depositYears * 12;
  const endMonth = depositMonths + input.growthYears * 12;

  const track = savingsTrack(input, 0);
  const interestValue = track.final.value - track.deposited.value;
  const interest = money(interestValue, 'formula.savings.interest', {
    balance: track.final.value,
    deposited: track.deposited.value,
  });
  const shareValue =
    track.final.value > 0 ? Math.round((interestValue / track.final.value) * 1000) / 10 : 0;
  const interestShare: Money = {
    value: shareValue,
    formulaId: 'formula.savings.share',
    params: {
      amount: interestValue,
      balance: track.final.value,
      sharePercent: shareValue,
      value: shareValue,
    },
  };

  let late: SavingsProjection['late'] = null;
  if (input.delayYears > 0 && input.delayYears < input.depositYears) {
    const lateTrack = savingsTrack(input, input.delayYears * 12);
    late = {
      track: lateTrack,
      missed: money(track.deposited.value - lateTrack.deposited.value, 'formula.savings.missed', {
        leftValue: track.deposited.value,
        rightValue: lateTrack.deposited.value,
      }),
      cost: money(track.final.value - lateTrack.final.value, 'formula.savings.cost', {
        leftValue: track.final.value,
        rightValue: lateTrack.final.value,
      }),
    };
  }

  return {
    input,
    monthlyRate,
    totalYears: endMonth / 12,
    track,
    interest,
    interestShare,
    late,
    rows: yearRows(input, monthlyRate, late !== null),
  };
}

/** A plan whose starting amount is placed at `startMonth` and whose deposits follow until the end of the deposit years. */
function savingsTrack(input: SavingsInput, startMonth: number): SavingsTrack {
  const rate = toMonthlyRate(input.annualReturn);
  const depositEndMonth = input.depositYears * 12;
  const endMonth = depositEndMonth + input.growthYears * 12;
  const months = depositEndMonth - startMonth;
  const years = months / 12;
  const growth = Math.pow(1 + rate, months);
  const annuity = rate === 0 ? months : (growth - 1) / rate;
  const savedValue = input.initial * growth + input.monthly * annuity;
  const ratePercent = input.annualReturn * 100;

  const depositedValue = input.initial + input.monthly * months;
  let deposited = depositedMoney(input, depositedValue, months);
  if (input.realDollars) {
    const today =
      input.initial * discountFactor(input.inflation, startMonth) +
      input.monthly *
        (presentValueFactor(input.inflation, depositEndMonth) -
          presentValueFactor(input.inflation, startMonth));
    deposited = flowToToday(deposited, input.inflation, today);
  }

  const saved =
    input.monthly === 0
      ? money(savedValue, 'formula.savings.saved.initialOnly', {
          initial: input.initial,
          years,
          ratePercent,
        })
      : input.initial > 0
        ? money(savedValue, 'formula.savings.saved.initial', {
            initial: input.initial,
            depositMonthly: input.monthly,
            months,
            years,
            ratePercent,
          })
        : money(savedValue, 'formula.savings.saved', {
            depositMonthly: input.monthly,
            months,
            years,
            ratePercent,
          });

  if (input.growthYears === 0) {
    return { deposited, depositEnd: null, final: atMonth(input, saved, endMonth) };
  }
  const final = money(
    savedValue * Math.pow(1 + input.annualReturn, input.growthYears),
    'formula.savings.final',
    { balance: savedValue, ratePercent, years: input.growthYears },
  );
  return {
    deposited,
    depositEnd: atMonth(input, saved, depositEndMonth),
    final: atMonth(input, final, endMonth),
  };
}

function depositedMoney(input: SavingsInput, value: number, months: number): Money {
  if (input.monthly === 0) {
    return money(value, 'formula.savings.deposited.initialOnly', { initial: input.initial });
  }
  if (input.initial > 0) {
    return money(value, 'formula.savings.deposited.initial', {
      initial: input.initial,
      depositMonthly: input.monthly,
      months,
    });
  }
  return money(value, 'formula.savings.deposited', { depositMonthly: input.monthly, months });
}

/** The balance at each year's end, in today's dollars when asked; the late start alongside. */
function yearRows(input: SavingsInput, rate: number, withLate: boolean): SavingsYearRow[] {
  const depositEndMonth = input.depositYears * 12;
  const endMonth = depositEndMonth + input.growthYears * 12;
  const lateStart = input.delayYears * 12;
  let balance = input.initial;
  let late = 0;
  let deposited = input.initial;
  const rows: SavingsYearRow[] = [];
  for (let month = 0; month <= endMonth; month++) {
    const factor = input.realDollars ? discountFactor(input.inflation, month) : 1;
    if (month > 0) {
      const deposit = month <= depositEndMonth ? input.monthly : 0;
      balance = balance * (1 + rate) + deposit;
      deposited += deposit * factor;
      late = late * (1 + rate) + (month > lateStart ? deposit : 0);
    }
    if (month === lateStart) late += input.initial;
    if (month % 12 === 0) {
      rows.push({
        year: month / 12,
        deposited,
        balance: balance * factor,
        late: withLate ? late * factor : null,
      });
    }
  }
  return rows;
}

/** A balance at a given month, brought back to today's dollars when asked. */
function atMonth(input: SavingsInput, amount: Money, month: number): Money {
  if (!input.realDollars) return amount;
  const value = amount.value * discountFactor(input.inflation, month);
  return {
    ...amount,
    value,
    steps: [
      {
        formulaId: 'formula.real.value',
        params: {
          nominal: amount.value,
          inflationPercent: input.inflation * 100,
          years: month / 12,
          value,
        },
      },
    ],
  };
}

/** Deposits made over time: each one is brought back from its own month. */
function flowToToday(amount: Money, inflation: number, value: number): Money {
  return {
    ...amount,
    value,
    steps: [
      {
        formulaId: 'formula.savings.real.flow',
        params: { nominal: amount.value, inflationPercent: inflation * 100, value },
      },
    ],
  };
}
