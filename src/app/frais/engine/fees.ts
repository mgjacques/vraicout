import { money } from '../../shared/engine/formulas';
import { clamp, finite } from '../../shared/engine/limits';
import { discountFactor, presentValueFactor } from '../../shared/engine/inflation';
import { Account, FormulaStep, Money } from '../../shared/engine/money';
import { toMonthlyRate } from '../../shared/engine/rates';
import { afterTax, rrspGrossUp } from '../../shared/engine/tax';
import { FeesInput, FeesProjection, FeesYearRow, PortfolioId, PortfolioResult } from './types';

const ACCOUNTS: readonly Account[] = ['tfsa', 'rrsp', 'taxable'];

/** One portfolio, by month: balance, fees taken since the start, and the same fees in today's dollars. */
interface Track {
  rate: number;
  balance: number[];
  fees: number[];
  feesReal: number[];
  /** Retirement only: every withdrawal before tax, added up, then in today's dollars. */
  withdrawn: number;
  withdrawnReal: number;
  firstWithdrawal: number;
}

/**
 * Grow two portfolios on the same deposits and the same return before fees.
 * Each month after the first: growth at the monthly equivalent of the yearly return,
 * then the monthly share of the fees (MER + advisor) is taken from the balance, then
 * the monthly deposit. Return and fees are both effective yearly rates, so a year
 * multiplies the balance by (1 + return) × (1 − fees).
 * The initial amount is invested at month 0. An RRSP also invests the tax refund
 * of every deposit. A third track with no fee measures what the fees cost.
 * In retirement, each portfolio pays a monthly withdrawal that rises with
 * inflation and empties it at the last month, while fees keep being taken.
 */
export function projectFees(raw: FeesInput): FeesProjection {
  const input = sanitize(raw);
  const savingMonths = input.years * 12;
  const drawdownMonths = input.drawdown.enabled ? input.drawdown.years * 12 : 0;
  const grossUp = rrspGrossUp(input.account, input.taxRate);
  const deposited = input.initialAmount + input.monthlyContribution * savingMonths;
  const contributed = deposited * grossUp;

  const feeRate = (id: PortfolioId) => input.portfolios[id].mer + input.portfolios[id].advisorFee;
  const tracks = {
    a: run(input, feeRate('a'), grossUp, savingMonths, drawdownMonths),
    b: run(input, feeRate('b'), grossUp, savingMonths, drawdownMonths),
    none: run(input, 0, grossUp, savingMonths, drawdownMonths),
  };

  const real = (amount: Money, month: number): Money =>
    input.realDollars ? toToday(amount, input.inflation, month) : amount;
  const noFeeBalance = tracks.none.balance[savingMonths];

  const noFee = {
    balance: real(
      money(noFeeBalance, 'formula.fees.balance.none', {
        initial: input.initialAmount * grossUp,
        contribution: input.monthlyContribution * grossUp,
        grossPercent: input.grossReturn * 100,
        years: input.years,
      }),
      savingMonths,
    ),
  };

  const portfolio = (id: PortfolioId): PortfolioResult => {
    const track = tracks[id];
    const balance = track.balance[savingMonths];
    const feePercent = track.rate * 100;
    const net = afterTax(input.account, input, balance, contributed, deposited);
    const taxShare = balance > 0 ? net.value / balance : 1;
    const feeCost = noFeeBalance - balance;
    const income =
      drawdownMonths > 0 ? incomeMoney(input, track, balance, net.tax, taxShare) : null;
    return {
      id,
      label: input.portfolios[id].label,
      feeRate: track.rate,
      balance: real(
        money(balance, 'formula.fees.balance', {
          initial: input.initialAmount * grossUp,
          contribution: input.monthlyContribution * grossUp,
          grossPercent: input.grossReturn * 100,
          feePercent,
          netPercent: netYearlyRate(input.grossReturn, track.rate) * 100,
          years: input.years,
        }),
        savingMonths,
      ),
      inHand: real(
        { ...money(net.value, 'formula.fees.inHand', { balance }), steps: [net.tax] },
        savingMonths,
      ),
      feesPaid: flow(
        input,
        money(track.fees[savingMonths], 'formula.fees.feesPaid', {
          feePercent,
          years: input.years,
        }),
        track.feesReal[savingMonths],
      ),
      feeCost: real(
        money(feeCost, 'formula.fees.feeCost', {
          noFee: noFeeBalance,
          balance,
          feePercent,
          sharePercent: share(feeCost, noFeeBalance) * 100,
        }),
        savingMonths,
      ),
      feeCostShare: share(feeCost, noFeeBalance),
      income: income ? real(income, savingMonths + 1) : null,
      incomeTotal:
        drawdownMonths > 0
          ? flow(
              input,
              money(track.withdrawn * taxShare, 'formula.fees.incomeTotal', {
                years: input.drawdown.years,
              }),
              track.withdrawnReal * taxShare,
            )
          : null,
      feesPaidDrawdown:
        drawdownMonths > 0
          ? flow(
              input,
              money(
                track.fees[savingMonths + drawdownMonths] - track.fees[savingMonths],
                'formula.fees.feesPaidDrawdown',
                { feePercent, years: input.drawdown.years },
              ),
              track.feesReal[savingMonths + drawdownMonths] - track.feesReal[savingMonths],
            )
          : null,
    };
  };

  const portfolios = { a: portfolio('a'), b: portfolio('b') };
  const cheaper: PortfolioId | null =
    feeRate('a') < feeRate('b') ? 'a' : feeRate('b') < feeRate('a') ? 'b' : null;

  return {
    input,
    savingMonths,
    drawdownMonths,
    deposited: flow(
      input,
      money(deposited, 'formula.fees.deposited', {
        initial: input.initialAmount,
        contribution: input.monthlyContribution,
        months: savingMonths,
      }),
      input.initialAmount +
        input.monthlyContribution * presentValueFactor(input.inflation, savingMonths),
    ),
    portfolios,
    noFee,
    gap: cheaper ? gapOf(portfolios, cheaper) : null,
    rows: rows(input, tracks, savingMonths, drawdownMonths),
  };
}

function run(
  input: FeesInput,
  rate: number,
  grossUp: number,
  savingMonths: number,
  drawdownMonths: number,
): Track {
  const track: Track = {
    rate,
    balance: [input.initialAmount * grossUp],
    fees: [0],
    feesReal: [0],
    withdrawn: 0,
    withdrawnReal: 0,
    firstWithdrawal: 0,
  };
  const monthlyReturn = toMonthlyRate(input.grossReturn);
  const monthlyFee = monthlyFeeRate(rate);
  const step = (month: number, flowIn: number): void => {
    const grown = track.balance[month - 1] * (1 + monthlyReturn);
    const fee = grown * monthlyFee;
    track.balance[month] = grown - fee + flowIn;
    track.fees[month] = track.fees[month - 1] + fee;
    track.feesReal[month] =
      track.feesReal[month - 1] + fee * discountFactor(input.inflation, month);
  };
  for (let month = 1; month <= savingMonths; month++) {
    step(month, input.monthlyContribution * grossUp);
  }
  if (drawdownMonths === 0) return track;

  const monthlyIndex = toMonthlyRate(input.inflation);
  track.firstWithdrawal = firstWithdrawal(
    track.balance[savingMonths],
    netMonthlyRate(input.grossReturn, rate),
    monthlyIndex,
    drawdownMonths,
  );
  for (let k = 1; k <= drawdownMonths; k++) {
    const month = savingMonths + k;
    const withdrawal = track.firstWithdrawal * Math.pow(1 + monthlyIndex, k - 1);
    step(month, -withdrawal);
    track.withdrawn += withdrawal;
    track.withdrawnReal += withdrawal * discountFactor(input.inflation, month);
  }
  return track;
}

/** Share of the balance taken each month so that a year takes `feeRate`: 1 − (1 − fees)^(1/12). */
export function monthlyFeeRate(feeRate: number): number {
  return 1 - Math.pow(1 - feeRate, 1 / 12);
}

/** Monthly growth left once the fees are taken: (1 + return)^(1/12) × (1 − fees)^(1/12) − 1. */
export function netMonthlyRate(grossReturn: number, feeRate: number): number {
  return (1 + toMonthlyRate(grossReturn)) * (1 - monthlyFeeRate(feeRate)) - 1;
}

/** Yearly growth left once the fees are taken: (1 + return) × (1 − fees) − 1. */
export function netYearlyRate(grossReturn: number, feeRate: number): number {
  return (1 + grossReturn) * (1 - feeRate) - 1;
}

/**
 * First of `months` withdrawals, paid at the end of each month and raised by `index`
 * every month, that bring `balance` to zero at the net monthly rate `rate`.
 * balance = Σ w (1 + index)^(k−1) / (1 + rate)^k, for k = 1..months.
 */
export function firstWithdrawal(
  balance: number,
  rate: number,
  index: number,
  months: number,
): number {
  if (months <= 0 || balance <= 0) return 0;
  const ratio = (1 + index) / (1 + rate);
  if (Math.abs(1 - ratio) < 1e-12) return (balance * (1 + rate)) / months;
  return (balance * (1 + rate) * (1 - ratio)) / (1 - Math.pow(ratio, months));
}

/** The first withdrawal, then the tax on it: the same share as on withdrawing everything at retirement. */
function incomeMoney(
  input: FeesInput,
  track: Track,
  balance: number,
  tax: FormulaStep,
  taxShare: number,
): Money {
  const beforeTax = track.firstWithdrawal;
  const value = beforeTax * taxShare;
  const base = money(value, 'formula.fees.income', {
    balance,
    beforeTax,
    years: input.drawdown.years,
    netPercent: netYearlyRate(input.grossReturn, track.rate) * 100,
    inflationPercent: input.inflation * 100,
  });
  const taxStep: FormulaStep = {
    formulaId: `formula.fees.income.tax.${input.account}`,
    params: {
      beforeTax,
      tax: beforeTax - value,
      laterPercent: tax.params['laterPercent'] ?? 0,
      taxSharePercent: (1 - taxShare) * 100,
      value,
    },
  };
  return { ...base, steps: [taxStep] };
}

function gapOf(
  portfolios: Record<PortfolioId, PortfolioResult>,
  cheaper: PortfolioId,
): NonNullable<FeesProjection['gap']> {
  const left = portfolios[cheaper];
  const right = portfolios[cheaper === 'a' ? 'b' : 'a'];
  const diff = (formulaId: string, l: Money | null, r: Money | null): Money | null =>
    l && r
      ? money(l.value - r.value, formulaId, { leftValue: l.value, rightValue: r.value })
      : null;
  return {
    cheaper,
    inHand: diff('formula.fees.gap.inHand', left.inHand, right.inHand)!,
    income: diff('formula.fees.gap.income', left.income, right.income),
    incomeTotal: diff('formula.fees.gap.incomeTotal', left.incomeTotal, right.incomeTotal),
  };
}

function rows(
  input: FeesInput,
  tracks: Record<PortfolioId | 'none', Track>,
  savingMonths: number,
  drawdownMonths: number,
): FeesYearRow[] {
  const out: FeesYearRow[] = [];
  for (let month = 0; month <= savingMonths + drawdownMonths; month += 12) {
    const factor = input.realDollars ? discountFactor(input.inflation, month) : 1;
    const fees = (track: Track) => (input.realDollars ? track.feesReal[month] : track.fees[month]);
    out.push({
      year: month / 12,
      month,
      phase: month <= savingMonths ? 'saving' : 'drawdown',
      balance: {
        a: Math.max(0, tracks.a.balance[month]) * factor,
        b: Math.max(0, tracks.b.balance[month]) * factor,
        none: Math.max(0, tracks.none.balance[month]) * factor,
      },
      feesPaid: { a: fees(tracks.a), b: fees(tracks.b) },
    });
  }
  return out;
}

/** A balance at a given month, brought back to today's dollars. */
function toToday(amount: Money, inflation: number, month: number): Money {
  const value = amount.value * discountFactor(inflation, month);
  return {
    ...amount,
    value,
    steps: [
      ...(amount.steps ?? []),
      {
        formulaId: 'formula.real.value',
        params: {
          nominal: amount.value,
          inflationPercent: inflation * 100,
          years: month / 12,
          value,
        },
      },
    ],
  };
}

/** Amounts paid over time (fees, deposits, withdrawals): each one is brought back from its own month. */
function flow(input: FeesInput, amount: Money, realValue: number): Money {
  if (!input.realDollars) return amount;
  return {
    ...amount,
    value: realValue,
    steps: [
      ...(amount.steps ?? []),
      {
        formulaId: 'formula.fees.real.flow',
        params: {
          nominal: amount.value,
          inflationPercent: input.inflation * 100,
          value: realValue,
        },
      },
    ],
  };
}

function share(part: number, whole: number): number {
  return whole > 0 ? part / whole : 0;
}

function sanitize(input: FeesInput): FeesInput {
  const taxRate = clamp(finite(input.taxRate, 0), 0, 0.6);
  const fees = (id: PortfolioId) => ({
    label: input.portfolios[id].label,
    mer: clamp(finite(input.portfolios[id].mer, 0), 0, 0.05),
    advisorFee: clamp(finite(input.portfolios[id].advisorFee, 0), 0, 0.03),
  });
  return {
    initialAmount: Math.max(0, finite(input.initialAmount, 0)),
    monthlyContribution: Math.max(0, finite(input.monthlyContribution, 0)),
    years: Math.round(clamp(finite(input.years, 30), 1, 60)),
    grossReturn: clamp(finite(input.grossReturn, 0), 0, 0.15),
    portfolios: { a: fees('a'), b: fees('b') },
    account: ACCOUNTS.includes(input.account) ? input.account : 'tfsa',
    taxRate,
    taxRateLater: clamp(finite(input.taxRateLater, taxRate), 0, 0.6),
    realDollars: Boolean(input.realDollars),
    inflation: clamp(finite(input.inflation, 0.02), 0, 0.1),
    drawdown: {
      enabled: Boolean(input.drawdown.enabled),
      years: Math.round(clamp(finite(input.drawdown.years, 25), 1, 50)),
    },
  };
}
