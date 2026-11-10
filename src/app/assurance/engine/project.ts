import { Anchor, interpolate } from './interpolate';
import { INSURANCE_LIMITS } from './limits';
import { money } from '../../shared/engine/formulas';
import { clamp, finite } from '../../shared/engine/limits';
import { discountFactor, presentValueFactor } from '../../shared/engine/inflation';
import { toMonthlyRate } from '../../shared/engine/rates';
import { afterTax, rrspGrossUp } from '../../shared/engine/tax';
import {
  Account,
  FormulaStep,
  Assumptions,
  BudgetPhase,
  ChartPoint,
  ChartSeries,
  Milestone,
  MilestoneKind,
  Money,
  Periodicity,
  Projection,
  ScenarioInput,
  SeriesId,
  StrategyId,
  StrategySnapshot,
  TermDuration,
  ValueAnchor,
  YearRow,
} from './types';

const TERM_DURATIONS: readonly TermDuration[] = [10, 20, 25, 30];

/**
 * One invested amount, by month: balance, what the person put in, what reached the
 * account (an RRSP adds the tax refund) and the number of deposits.
 */
interface GapPocket {
  balance: number[];
  deposited: number[];
  contributed: number[];
  deposits: number[];
}

/** Highest return the engine accepts; the break-even search goes this far. */
const MAX_RETURN = 0.15;

interface Model {
  currentAge: number;
  horizonAge: number;
  horizonMonths: number;
  termEndAge: number;
  paidUpAge: number;
  nowYear: number;
  periodicity: Periodicity;
  termPeriodicity: Periodicity;
  premiumEntered: number;
  termPremiumEntered: number;
  permMonthly: number;
  termMonthly: number;
  premiumMonths: number;
  termMonths: number;
  termYears: number;
  face: number;
  termFace: number;
  projectedGrowth: number;
  annualReturn: number;
  reinvestShare: number;
  extraMonthly: number;
  projected: Anchor[];
  guaranteed: Anchor[];
  keepGap: GapPocket;
  termGap: GapPocket;
  extra: GapPocket;
  account: Account;
  taxRate: number;
  taxRateLater: number;
  realDollars: boolean;
  inflation: number;
  surrender: number;
  assumptions: Assumptions;
}

/**
 * Project both strategies on the same monthly budget.
 * Each month, the keep side pays the permanent premium while premiums remain,
 * and the term side pays the term premium while the term runs.
 * The side that pays less invests the gap (times the reinvested share),
 * so both sides spend the same amount every month.
 * Each month after the first applies interest, then the deposit.
 * The yearly return is an effective rate; each month grows at its monthly equivalent.
 */
export function project(input: ScenarioInput, nowYear = new Date().getFullYear()): Projection {
  const model = buildModel(input, nowYear);
  const years: YearRow[] = [];
  for (let month = 0; month <= model.horizonMonths; month += 12) {
    years.push(yearRow(model, month));
  }
  if (model.horizonMonths % 12 !== 0) {
    years.push(yearRow(model, model.horizonMonths));
  }
  const lastTermMonth = model.termMonths - 1;
  const beforeTermEnd =
    lastTermMonth > 0 && lastTermMonth < model.horizonMonths ? yearRow(model, lastTermMonth) : null;
  return {
    currentAge: model.currentAge,
    horizonAge: model.horizonAge,
    termEndAge: model.termEndAge,
    paidUpAge: model.paidUpAge,
    nowYear: model.nowYear,
    assumptions: model.assumptions,
    years,
    milestones: milestones(model),
    beforeTermEnd,
    series: series(model, years, beforeTermEnd),
  };
}

/** Snapshot at an exact month. Months outside the horizon are clamped. */
export function projectMonth(
  input: ScenarioInput,
  month: number,
  nowYear = new Date().getFullYear(),
): StrategySnapshot[] {
  const model = buildModel(input, nowYear);
  const clamped = Math.min(model.horizonMonths, Math.max(0, month));
  return snapshot(model, clamped);
}

export type BreakEven =
  | { kind: 'rate'; rate: number; above: StrategyId }
  | { kind: 'always'; ahead: StrategyId; upTo: number };

/**
 * The yearly return at which both options leave the same amount in hand at a month
 * (cash value and invested money on the keep side, invested money on the term side).
 * Everything else in the input stays as entered. Null at month 0, where nothing differs yet.
 */
export function breakEvenReturn(input: ScenarioInput, month: number): BreakEven | null {
  if (month <= 0) return null;
  // The search only needs the months up to the target, so the projection stops there.
  const ageAt = input.profile.currentAge + month / 12;
  const gap = (rate: number) => {
    const shortened: ScenarioInput = {
      ...input,
      profile: { ...input.profile, horizonAge: ageAt },
      params: { ...input.params, annualReturn: rate },
    };
    const row = projectMonth(shortened, month);
    return strategy(row, 'termInvest').inHand.value - strategy(row, 'keep').inHand.value;
  };
  const step = 0.005;
  let low = 0;
  let lowGap = gap(0);
  for (let rate = step; rate <= MAX_RETURN + 1e-9; rate += step) {
    const rateGap = gap(rate);
    if (Math.sign(rateGap) !== Math.sign(lowGap) && rateGap !== 0) {
      let high = rate;
      for (let i = 0; i < 20; i++) {
        const mid = (low + high) / 2;
        if (Math.sign(gap(mid)) === Math.sign(lowGap)) low = mid;
        else high = mid;
      }
      return { kind: 'rate', rate: (low + high) / 2, above: rateGap > 0 ? 'termInvest' : 'keep' };
    }
    low = rate;
    lowGap = rateGap;
  }
  return { kind: 'always', ahead: lowGap > 0 ? 'termInvest' : 'keep', upTo: MAX_RETURN };
}

export function strategy(
  strategies: readonly StrategySnapshot[],
  id: StrategyId,
): StrategySnapshot {
  const found = strategies.find((item) => item.id === id);
  if (!found) throw new Error(`Missing strategy ${id}`);
  return found;
}

/** Capped at the field's maximum; only the end of the term can push the projection past it. */
export function defaultHorizonAge(currentAge: number, termYears: number): number {
  const termEnd = currentAge + termYears;
  const plus40 = Math.min(currentAge + 40, INSURANCE_LIMITS.horizonAge.max);
  const retirement = currentAge < 65 ? 65 : currentAge;
  return Math.max(plus40, retirement, termEnd);
}

function buildModel(input: ScenarioInput, nowYear: number): Model {
  const currentAge = clamp(Math.round(finite(input.profile.currentAge, 35)), 0, 110);
  const termYears = TERM_DURATIONS.includes(input.term.durationYears)
    ? input.term.durationYears
    : 20;
  const termEndAge = currentAge + termYears;
  const requested = finite(input.profile.horizonAge, 0);
  const horizonAge = Math.max(
    termEndAge,
    currentAge,
    requested > 0 ? requested : defaultHorizonAge(currentAge, termYears),
  );
  const horizonMonths = Math.round((horizonAge - currentAge) * 12);
  const termMonths = termYears * 12;

  const periodicity: Periodicity = input.permanent.periodicity === 'year' ? 'year' : 'month';
  const termPeriodicity: Periodicity = input.term.periodicity === 'year' ? 'year' : 'month';
  const premiumEntered = nonNegative(input.permanent.premium);
  const termPremiumEntered = nonNegative(input.term.premium);
  const permMonthly = periodicity === 'year' ? premiumEntered / 12 : premiumEntered;
  const termMonthly = termPeriodicity === 'year' ? termPremiumEntered / 12 : termPremiumEntered;
  const premiumMonths = Math.round(
    clamp(nonNegative(input.permanent.premiumYearsRemaining), 0, 80) * 12,
  );
  const projectedGrowth = clamp(finite(input.permanent.projectedGrowth, 0), 0, 0.1);
  const annualReturn = clamp(finite(input.params.annualReturn, 0), 0, MAX_RETURN);
  const reinvestShare = clamp(finite(input.params.reinvestShare, 1), 0, 1);
  const extraMonthly = nonNegative(input.params.extraSavingsMonthly);
  const account: Account = ['tfsa', 'rrsp', 'taxable'].includes(input.params.account)
    ? input.params.account
    : 'tfsa';
  const taxRate = clamp(finite(input.params.taxRate, 0), 0, 0.6);
  const taxRateLater = clamp(finite(input.params.taxRateLater, taxRate), 0, 0.6);
  const realDollars = input.params.realDollars === true;
  const inflation = clamp(finite(input.params.inflation, 0.02), 0, 0.1);
  // An RRSP deposit brings a refund at today's rate; it is assumed to go back into the RRSP.
  const grossUp = rrspGrossUp(account, taxRate);

  const keepOutlay = (month: number) => (month <= premiumMonths ? permMonthly : 0);
  const termOutlay = (month: number) => (month <= termMonths ? termMonthly : 0);

  const cashValueNow = nonNegative(input.permanent.cashValueNow);
  const surrender = input.permanent.inForce === true ? cashValueNow : 0;
  const keepGap = emptyPocket();
  // Ending the contract today puts its cash value in the term side's pocket at month 0.
  const termGap = emptyPocket(surrender, grossUp);
  const extra = emptyPocket();
  const monthlyRate = toMonthlyRate(annualReturn);
  for (let month = 1; month <= horizonMonths; month++) {
    const gap = keepOutlay(month) - termOutlay(month);
    grow(termGap, month, monthlyRate, gap > 0 ? gap * reinvestShare : 0, grossUp);
    grow(keepGap, month, monthlyRate, gap < 0 ? -gap * reinvestShare : 0, grossUp);
    grow(extra, month, monthlyRate, extraMonthly, grossUp);
  }

  const projected = projectedAnchors(currentAge, cashValueNow, input.permanent.anchors);
  const guaranteed = guaranteedAnchors(currentAge, input.permanent.anchors);
  const phases = budgetPhases(horizonMonths, keepOutlay, termOutlay, reinvestShare);

  const assumptions: Assumptions = {
    permMonthly,
    termMonthly,
    phases,
    keepInvests: phases.some((phase) => phase.side === 'keep' && phase.deposit > 0),
    reinvestShare,
    annualReturn,
    extraMonthly,
    account,
    taxRate,
    taxRateLater,
    realDollars,
    inflation,
    surrender,
    premiumMonths,
    termMonths,
    termYears,
    projectedGrowth,
    cashScale: projected.some((anchor) => anchor.month > 0) || guaranteed.length > 0,
  };

  return {
    currentAge,
    horizonAge,
    horizonMonths,
    termEndAge,
    paidUpAge: currentAge + premiumMonths / 12,
    nowYear,
    periodicity,
    termPeriodicity,
    premiumEntered,
    termPremiumEntered,
    permMonthly,
    termMonthly,
    premiumMonths,
    termMonths,
    termYears,
    face: nonNegative(input.permanent.deathBenefit),
    termFace: nonNegative(input.term.deathBenefit),
    projectedGrowth,
    annualReturn,
    reinvestShare,
    extraMonthly,
    projected,
    guaranteed,
    keepGap,
    termGap,
    extra,
    account,
    taxRate,
    taxRateLater,
    realDollars,
    inflation,
    surrender,
    assumptions,
  };
}

/** A pocket, empty or opened today with a lump sum (an RRSP adds its refund, as for every deposit). */
function emptyPocket(lump = 0, grossUp = 1): GapPocket {
  const contribution = lump * grossUp;
  return {
    balance: [contribution],
    deposited: [lump],
    contributed: [contribution],
    deposits: [lump > 0 ? 1 : 0],
  };
}

function grow(
  pocket: GapPocket,
  month: number,
  monthlyRate: number,
  deposit: number,
  grossUp: number,
): void {
  const contribution = deposit * grossUp;
  const previous = pocket.balance[month - 1] ?? 0;
  pocket.balance[month] = previous * (1 + monthlyRate) + contribution;
  pocket.deposited[month] = (pocket.deposited[month - 1] ?? 0) + deposit;
  pocket.contributed[month] = (pocket.contributed[month - 1] ?? 0) + contribution;
  pocket.deposits[month] = (pocket.deposits[month - 1] ?? 0) + (deposit > 0 ? 1 : 0);
}

/** What the person would have in hand after tax by withdrawing the pocket at that month. */
function pocketAfterTax(
  model: Model,
  pocket: GapPocket,
  month: number,
): { value: number; tax: FormulaStep } {
  return afterTax(
    model.account,
    model,
    pocket.balance[month] ?? 0,
    pocket.contributed[month] ?? 0,
    pocket.deposited[month] ?? 0,
  );
}

function budgetPhases(
  horizonMonths: number,
  keepOutlay: (month: number) => number,
  termOutlay: (month: number) => number,
  reinvestShare: number,
): BudgetPhase[] {
  const phases: BudgetPhase[] = [];
  for (let month = 1; month <= horizonMonths; month++) {
    const keepMonthly = keepOutlay(month);
    const termMonthly = termOutlay(month);
    const last = phases[phases.length - 1];
    if (last && last.keepMonthly === keepMonthly && last.termMonthly === termMonthly) {
      last.toMonth = month;
      continue;
    }
    const gap = Math.abs(keepMonthly - termMonthly);
    phases.push({
      fromMonth: month,
      toMonth: month,
      keepMonthly,
      termMonthly,
      side: keepMonthly > termMonthly ? 'termInvest' : termMonthly > keepMonthly ? 'keep' : null,
      gap,
      deposit: gap * reinvestShare,
      spent: gap * (1 - reinvestShare),
    });
  }
  return phases;
}

/**
 * Today's cash value, then each entered value. A row with only a guaranteed value stands in
 * for the projection. At month 0, today's value wins over a row when it was entered.
 */
function projectedAnchors(
  currentAge: number,
  cashValueNow: number,
  anchors: readonly ValueAnchor[],
): Anchor[] {
  const points = new Map<number, number>();
  for (const anchor of anchors) {
    const value = anchor.projected ?? anchor.guaranteed;
    if (value === null || !Number.isFinite(value)) continue;
    const month = Math.round((anchor.age - currentAge) * 12);
    if (month < 0) continue;
    points.set(month, nonNegative(value));
  }
  if (cashValueNow > 0 || !points.has(0)) points.set(0, cashValueNow);
  return sortAnchors(points);
}

function guaranteedAnchors(currentAge: number, anchors: readonly ValueAnchor[]): Anchor[] {
  const points = new Map<number, number>();
  for (const anchor of anchors) {
    if (anchor.guaranteed === null || !Number.isFinite(anchor.guaranteed)) continue;
    const month = Math.round((anchor.age - currentAge) * 12);
    if (month < 0) continue;
    points.set(month, nonNegative(anchor.guaranteed));
  }
  return sortAnchors(points);
}

function sortAnchors(points: Map<number, number>): Anchor[] {
  return [...points.entries()]
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month - b.month);
}

function yearRow(model: Model, month: number): YearRow {
  const age = model.currentAge + month / 12;
  return {
    age,
    month,
    calendarYear: model.nowYear + (age - model.currentAge),
    strategies: snapshot(model, month),
  };
}

function snapshot(model: Model, month: number): StrategySnapshot[] {
  const nominal = nominalSnapshot(model, month);
  return model.realDollars ? nominal.map((item) => toToday(model, item, month)) : nominal;
}

/**
 * Converts every amount of a snapshot to today's dollars.
 * A stock (death benefit, balance) is discounted from its month. Premiums paid
 * over time are each discounted from the month they are paid.
 */
function toToday(model: Model, item: StrategySnapshot, month: number): StrategySnapshot {
  const factor = discountFactor(model.inflation, month);
  const inflationPercent = model.inflation * 100;
  const years = month / 12;
  const stock = (amount: Money): Money => ({
    ...amount,
    value: amount.value * factor,
    steps: [
      ...(amount.steps ?? []),
      {
        formulaId: 'formula.real.value',
        params: { nominal: amount.value, inflationPercent, years, value: amount.value * factor },
      },
    ],
  });
  const monthsPaid = Math.min(month, item.id === 'keep' ? model.premiumMonths : model.termMonths);
  const monthly = item.id === 'keep' ? model.permMonthly : model.termMonthly;
  const realCost = monthly * presentValueFactor(model.inflation, monthsPaid);
  return {
    ...item,
    cost: {
      ...item.cost,
      value: realCost,
      steps: [
        {
          formulaId: 'formula.real.cost',
          params: { nominal: item.cost.value, inflationPercent, value: realCost },
        },
      ],
    },
    deathBenefit: stock(item.deathBenefit),
    deathBenefitProjected: item.deathBenefitProjected ? stock(item.deathBenefitProjected) : null,
    alive: stock(item.alive),
    aliveGuaranteed: item.aliveGuaranteed ? stock(item.aliveGuaranteed) : null,
    gapSavings: item.gapSavings ? stock(item.gapSavings) : null,
    extraSavings: stock(item.extraSavings),
    aliveCombined: stock(item.aliveCombined),
    inHand: stock(item.inHand),
    inHandGuaranteed: item.inHandGuaranteed ? stock(item.inHandGuaranteed) : null,
    forHeirs: stock(item.forHeirs),
    forHeirsProjected: item.forHeirsProjected ? stock(item.forHeirsProjected) : null,
  };
}

function nominalSnapshot(model: Model, month: number): StrategySnapshot[] {
  const extraSavings = extraMoney(model, month);
  const projectedCash = cashMoney(model, month, 'projected');
  const guaranteedCash = cashMoney(model, month, 'guaranteed');
  const termSavings = gapMoney(model, month, 'termInvest');
  const keepSavings = model.assumptions.keepInvests ? gapMoney(model, month, 'keep') : null;
  const keepMonthsPaid = Math.min(month, model.premiumMonths);
  const termMonthsPaid = Math.min(month, model.termMonths);

  const keepSavingsValue = keepSavings?.value ?? 0;
  const keepAlive =
    projectedCash ??
    money(0, 'formula.cash.projected.flat', {
      leftAge: model.currentAge,
      leftValue: 0,
      rightAge: model.currentAge,
      rightValue: 0,
    });
  const keepDeath = money(model.face, 'formula.death.keep.guaranteed', { face: model.face });
  const keepDeathProjected =
    model.projectedGrowth > 0
      ? money(
          model.face * Math.pow(1 + model.projectedGrowth, month / 12),
          'formula.death.keep.projected',
          {
            face: model.face,
            growthPercent: model.projectedGrowth * 100,
            years: month / 12,
          },
        )
      : null;
  const keep: StrategySnapshot = {
    id: 'keep',
    cost: money(
      model.permMonthly * keepMonthsPaid,
      model.periodicity === 'year' ? 'formula.cost.keep.year' : 'formula.cost.keep.month',
      {
        premiumMonthly: model.permMonthly,
        premiumEntered: model.premiumEntered,
        monthsPaid: keepMonthsPaid,
      },
    ),
    deathBenefit: keepDeath,
    deathBenefitProjected: keepDeathProjected,
    alive: keepAlive,
    aliveGuaranteed: guaranteedCash,
    gapSavings: keepSavings,
    extraSavings,
    aliveCombined: keepSavings
      ? money(
          keepAlive.value + keepSavings.value + extraSavings.value,
          'formula.combined.keepGap',
          {
            cash: keepAlive.value,
            savings: keepSavings.value,
            extra: extraSavings.value,
          },
        )
      : money(keepAlive.value + extraSavings.value, 'formula.combined.keep', {
          cash: keepAlive.value,
          extra: extraSavings.value,
        }),
    inHand: total('formula.inHand.keep', 'cash', keepAlive.value, keepSavingsValue),
    inHandGuaranteed: guaranteedCash
      ? total('formula.inHand.keepGuaranteed', 'cash', guaranteedCash.value, keepSavingsValue)
      : null,
    forHeirs: total('formula.forHeirs.keep', 'face', keepDeath.value, keepSavingsValue),
    forHeirsProjected: keepDeathProjected
      ? total('formula.forHeirs.keepProjected', 'face', keepDeathProjected.value, keepSavingsValue)
      : null,
  };

  const termAlive = month < model.termMonths;
  const termDeath = termAlive ? model.termFace : 0;
  const term: StrategySnapshot = {
    id: 'termInvest',
    cost: money(
      model.termMonthly * termMonthsPaid,
      model.termPeriodicity === 'year' ? 'formula.cost.term.year' : 'formula.cost.term.month',
      {
        premiumMonthly: model.termMonthly,
        premiumEntered: model.termPremiumEntered,
        monthsPaid: termMonthsPaid,
        termYears: model.termYears,
      },
    ),
    deathBenefit: money(
      termDeath,
      termAlive ? 'formula.death.term.alive' : 'formula.death.term.ended',
      {
        face: model.termFace,
        termYears: model.termYears,
      },
    ),
    deathBenefitProjected: null,
    alive: termSavings,
    aliveGuaranteed: null,
    gapSavings: null,
    extraSavings,
    aliveCombined: money(termSavings.value + extraSavings.value, 'formula.combined.term', {
      savings: termSavings.value,
      extra: extraSavings.value,
    }),
    inHand: money(termSavings.value, 'formula.inHand.term', { savings: termSavings.value }),
    inHandGuaranteed: null,
    forHeirs: total(
      termAlive ? 'formula.forHeirs.term' : 'formula.forHeirs.termEnded',
      'face',
      termDeath,
      termSavings.value,
    ),
    forHeirsProjected: null,
  };

  return [keep, term];
}

/** A side's total: one amount (cash value or insurance) plus the invested money, extra savings left out. */
function total(formulaId: string, kind: 'cash' | 'face', amount: number, savings: number): Money {
  return money(amount + savings, formulaId, { [kind]: amount, savings });
}

function cashMoney(model: Model, month: number, kind: 'projected' | 'guaranteed'): Money | null {
  const anchors = kind === 'projected' ? model.projected : model.guaranteed;
  const hit = interpolate(month, anchors);
  if (!hit) return null;
  return money(hit.value, `formula.cash.${kind}.${hit.method}`, {
    leftValue: hit.left.value,
    rightValue: hit.right.value,
    leftAge: model.currentAge + hit.left.month / 12,
    rightAge: model.currentAge + hit.right.month / 12,
  });
}

function gapMoney(model: Model, month: number, side: StrategyId): Money {
  const pocket = side === 'keep' ? model.keepGap : model.termGap;
  const deposits = pocket.deposits[month] ?? 0;
  const prefix = side === 'keep' ? 'formula.gap.keep' : 'formula.gap.term';
  if (deposits === 0) {
    return money(0, `${prefix}.none`, { reinvestPercent: model.reinvestShare * 100 });
  }
  const net = pocketAfterTax(model, pocket, month);
  // The cash value received today is one deposit, told apart from the monthly ones.
  const surrender = side === 'termInvest' ? model.surrender : 0;
  const monthly = deposits - (surrender > 0 ? 1 : 0);
  const formulaId =
    surrender <= 0
      ? prefix
      : monthly > 0
        ? 'formula.gap.term.surrender'
        : 'formula.gap.term.surrenderOnly';
  return {
    ...money(net.value, formulaId, {
      surrender,
      deposited: (pocket.deposited[month] ?? 0) - surrender,
      deposits: monthly,
      reinvestPercent: model.reinvestShare * 100,
      annualReturnPercent: model.annualReturn * 100,
      beforeTax: pocket.balance[month] ?? 0,
    }),
    steps: [net.tax],
  };
}

function extraMoney(model: Model, month: number): Money {
  if (model.extraMonthly <= 0) {
    return money(0, 'formula.extra.zero', { extraMonthly: 0, monthsPaid: month });
  }
  const net = pocketAfterTax(model, model.extra, month);
  return {
    ...money(net.value, 'formula.extra.annuity', {
      extraMonthly: model.extraMonthly,
      monthsPaid: month,
      annualReturnPercent: model.annualReturn * 100,
      beforeTax: model.extra.balance[month] ?? 0,
    }),
    steps: [net.tax],
  };
}

function milestones(model: Model): Milestone[] {
  const points: { month: number; kinds: MilestoneKind[] }[] = [];
  const add = (month: number, kind: MilestoneKind) => {
    if (month < 0 || month > model.horizonMonths) return;
    const existing = points.find((point) => point.month === month);
    if (existing) existing.kinds.push(kind);
    else points.push({ month, kinds: [kind] });
  };
  // The term's last full year, while it still pays: a year before its end.
  add(model.termMonths - 12, 'beforeTermEnd');
  add(model.termMonths, 'termEnd');
  if (model.currentAge < 65) {
    add(Math.round((65 - model.currentAge) * 12), 'age65');
  }
  add(model.horizonMonths, 'horizon');
  points.sort((a, b) => a.month - b.month);
  return points.map((point) => ({
    month: point.month,
    age: model.currentAge + point.month / 12,
    kinds: point.kinds,
    strategies: snapshot(model, point.month),
  }));
}

function series(
  model: Model,
  years: readonly YearRow[],
  beforeTermEnd: YearRow | null,
): ChartSeries[] {
  // The death chart also gets the term's last month: its amount drops there, not over a year.
  const deathRows = beforeTermEnd
    ? [...years, beforeTermEnd].sort((left, right) => left.month - right.month)
    : years;
  const point = (
    row: YearRow,
    read: (strategies: StrategySnapshot[]) => number | null,
  ): ChartPoint => ({
    age: row.age,
    month: row.month,
    value: read(row.strategies),
  });

  const built: (ChartSeries | null)[] = [
    line('keepHeirs', 'death', false, deathRows, (row) =>
      point(row, (items) => keepFrom(items).forHeirs.value),
    ),
    model.projectedGrowth > 0
      ? line('keepHeirsProjected', 'death', true, deathRows, (row) =>
          point(row, (items) => keepFrom(items).forHeirsProjected?.value ?? null),
        )
      : null,
    line('termHeirs', 'death', false, deathRows, (row) =>
      point(row, (items) => termFrom(items).forHeirs.value),
    ),
    line('keepInHand', 'alive', false, years, (row) =>
      point(row, (items) => keepFrom(items).inHand.value),
    ),
    line('keepInHandGuaranteed', 'alive', true, years, (row) =>
      point(row, (items) => keepFrom(items).inHandGuaranteed?.value ?? null),
    ),
    model.extraMonthly > 0
      ? line('extra', 'alive', false, years, (row) =>
          point(row, (items) => keepFrom(items).extraSavings.value),
        )
      : null,
    line('termInHand', 'alive', false, years, (row) =>
      point(row, (items) => termFrom(items).inHand.value),
    ),
  ];
  return built.filter(
    (item): item is ChartSeries =>
      item !== null && item.points.some((entry) => entry.value !== null),
  );
}

function keepFrom(items: StrategySnapshot[]): StrategySnapshot {
  return strategy(items, 'keep');
}

function termFrom(items: StrategySnapshot[]): StrategySnapshot {
  return strategy(items, 'termInvest');
}

function line(
  id: SeriesId,
  chart: ChartSeries['chart'],
  dashed: boolean,
  years: readonly YearRow[],
  read: (row: YearRow) => ChartPoint,
): ChartSeries {
  return { id, chart, dashed, points: years.map(read) };
}

function nonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
