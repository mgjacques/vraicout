import { describe, expect, it } from 'vitest';
import { explain, explainMoney, formatMoneyExact } from '../../shared/engine/formulas';
import { fr } from '../../shared/i18n/fr';
import { exampleScenario } from './example';
import { breakEvenReturn, defaultHorizonAge, project, projectMonth, strategy } from './project';
import { ScenarioInput, SeriesId } from './types';

type Overrides = { [K in keyof ScenarioInput]?: Partial<ScenarioInput[K]> };

function quote(overrides: Overrides = {}): ScenarioInput {
  const base = exampleScenario();
  return {
    ...base,
    ...overrides,
    profile: { ...base.profile, ...overrides.profile },
    permanent: {
      ...base.permanent,
      ...overrides.permanent,
      anchors: overrides.permanent?.anchors ?? base.permanent.anchors,
    },
    term: { ...base.term, ...overrides.term },
    params: { ...base.params, ...overrides.params },
  };
}

describe('project', () => {
  it('applies interest before the deposit', () => {
    const input = quote({
      profile: { currentAge: 40, horizonAge: 50 },
      permanent: {
        premium: 150,
        periodicity: 'month',
        deathBenefit: 100000,
        cashValueNow: 0,
        premiumYearsRemaining: 20,
        projectedGrowth: 0,
        anchors: [],
      },
      term: { premium: 50, periodicity: 'month', deathBenefit: 250000, durationYears: 10 },
      params: { annualReturn: 0.1, reinvestShare: 1, extraSavingsMonthly: 0 },
    });
    const alive = strategy(projectMonth(input, 2), 'termInvest').alive;
    // The yearly return is effective: 10 % a year is (1.1)^(1/12) − 1 a month.
    const rate = Math.pow(1.1, 1 / 12) - 1;
    const interestThenDeposit = 100 * (1 + rate) + 100;
    const depositThenInterest = (100 * (1 + rate) + 100) * (1 + rate);
    expect(alive.value).toBeCloseTo(interestThenDeposit, 8);
    expect(Math.abs(alive.value - depositThenInterest)).toBeGreaterThan(1);
    expect(alive.params['value']).toBe(alive.value);
    const text = explain(alive.formulaId, alive.params, (key) => fr[key as keyof typeof fr]);
    expect(text).toContain(formatMoneyExact(200));
    expect(text).toContain('2 versements');
  });

  it('gives both sides the same outlay every month', () => {
    const input = quote({
      profile: { currentAge: 40, horizonAge: 55 },
      permanent: {
        premium: 100,
        periodicity: 'month',
        deathBenefit: 50000,
        cashValueNow: 0,
        premiumYearsRemaining: 1,
        projectedGrowth: 0,
        anchors: [],
      },
      term: { premium: 40, periodicity: 'month', deathBenefit: 200000, durationYears: 10 },
      params: { annualReturn: 0, reinvestShare: 1, extraSavingsMonthly: 0 },
    });
    const outlay = (month: number) => {
      const row = projectMonth(input, month);
      const keep = strategy(row, 'keep');
      const term = strategy(row, 'termInvest');
      return {
        keep: keep.cost.value + (keep.gapSavings?.value ?? 0),
        term: term.cost.value + term.alive.value,
        keepSavings: keep.gapSavings?.value ?? 0,
        termSavings: term.alive.value,
      };
    };
    // Year 1: the permanent costs 60 $ more, the term side invests it.
    // Year 2 on: the permanent is paid up, the term still costs 40 $, the keep side invests that.
    const atTwoYears = outlay(24);
    expect(atTwoYears.termSavings).toBeCloseTo(720, 5);
    expect(atTwoYears.keepSavings).toBeCloseTo(480, 5);
    expect(atTwoYears.keep).toBeCloseTo(atTwoYears.term, 5);
    for (const month of [1, 12, 13, 60, 119, 120, 121, 180]) {
      const sides = outlay(month);
      expect(sides.keep).toBeCloseTo(sides.term, 5);
    }
    expect(outlay(132).keepSavings).toBeCloseTo(outlay(120).keepSavings, 5);
    expect(outlay(120).keepSavings).toBeCloseTo(40 * 108, 5);

    expect(strategy(projectMonth(input, 120), 'termInvest').deathBenefit.value).toBe(0);
    expect(strategy(projectMonth(input, 119), 'termInvest').deathBenefit.value).toBe(200000);
    expect(strategy(projectMonth(input, 13), 'keep').cost.value).toBeCloseTo(1200, 5);
  });

  it('invents no money when the permanent is already paid up', () => {
    const input = quote({
      profile: { currentAge: 40, horizonAge: 60 },
      permanent: {
        premium: 100,
        periodicity: 'month',
        deathBenefit: 50000,
        cashValueNow: 0,
        premiumYearsRemaining: 0,
        projectedGrowth: 0,
        anchors: [],
      },
      term: { premium: 30, periodicity: 'month', deathBenefit: 200000, durationYears: 10 },
      params: { annualReturn: 0, reinvestShare: 1, extraSavingsMonthly: 0 },
    });
    const row = projectMonth(input, 120);
    expect(strategy(row, 'termInvest').alive.value).toBe(0);
    expect(strategy(row, 'keep').cost.value).toBe(0);
    expect(strategy(row, 'keep').gapSavings?.value).toBeCloseTo(3600, 5);
    const phases = project(input, 2026).assumptions.phases;
    expect(phases.map((phase) => [phase.fromMonth, phase.toMonth, phase.side])).toEqual([
      [1, 120, 'keep'],
      [121, 240, null],
    ]);
  });

  it('taxes what you could take out according to the account', () => {
    const base = {
      profile: { currentAge: 40, horizonAge: 55 },
      permanent: {
        premium: 100,
        periodicity: 'month' as const,
        deathBenefit: 50000,
        cashValueNow: 0,
        premiumYearsRemaining: 20,
        projectedGrowth: 0,
        anchors: [],
      },
      term: {
        premium: 40,
        periodicity: 'month' as const,
        deathBenefit: 200000,
        durationYears: 10 as const,
      },
    };
    const at = (params: Partial<ScenarioInput['params']>) =>
      strategy(
        projectMonth(
          quote({
            ...base,
            params: { annualReturn: 0.06, reinvestShare: 1, extraSavingsMonthly: 0, ...params },
          }),
          120,
        ),
        'termInvest',
      ).alive;

    const tfsa = at({ account: 'tfsa' });
    const balance = tfsa.params['beforeTax'] ?? 0;
    expect(tfsa.value).toBeCloseTo(balance, 6);

    // Same rate in and out: the RRSP refund exactly offsets the tax on withdrawal.
    expect(at({ account: 'rrsp', taxRate: 0.3, taxRateLater: 0.3 }).value).toBeCloseTo(
      tfsa.value,
      6,
    );
    expect(at({ account: 'rrsp', taxRate: 0.4, taxRateLater: 0.2 }).value).toBeGreaterThan(
      tfsa.value,
    );

    const taxable = at({ account: 'taxable', taxRate: 0.4 });
    const gain = balance - 60 * 120;
    expect(taxable.value).toBeCloseTo(balance - gain * 0.5 * 0.4, 6);
    const text = explainMoney(taxable, (key) => fr[key as keyof typeof fr]);
    expect(text).toContain(formatMoneyExact(gain));
    expect(text).toContain('40\u00a0%');
  });

  it("converts every amount to today's dollars when asked", () => {
    const nominal = quote({});
    const real = quote({ params: { realDollars: true, inflation: 0.02 } });
    const month = 120;
    const factor = Math.pow(1.02, -10);
    const keepNominal = strategy(projectMonth(nominal, month), 'keep');
    const keepReal = strategy(projectMonth(real, month), 'keep');
    expect(keepReal.deathBenefit.value).toBeCloseTo(keepNominal.deathBenefit.value * factor, 6);
    expect(keepReal.alive.value).toBeCloseTo(keepNominal.alive.value * factor, 6);

    // Each premium is discounted from the month it is paid.
    let expected = 0;
    for (let k = 1; k <= month; k++) expected += 100 * Math.pow(1.02, -k / 12);
    expect(keepReal.cost.value).toBeCloseTo(expected, 6);
    expect(keepReal.cost.value).toBeLessThan(keepNominal.cost.value);

    const text = explainMoney(keepReal.deathBenefit, (key) => fr[key as keyof typeof fr]);
    expect(text).toContain('2\u00a0%');
    expect(text).toContain(formatMoneyExact(keepReal.deathBenefit.value));
  });

  it('finds the return at which both options leave the same amount in hand', () => {
    const input = quote({
      profile: { currentAge: 30, horizonAge: 70 },
      params: { annualReturn: 0.06, reinvestShare: 1, extraSavingsMonthly: 0, account: 'tfsa' },
    });
    const month = 25 * 12;
    const found = breakEvenReturn(input, month);
    expect(found?.kind).toBe('rate');
    if (found?.kind !== 'rate') return;
    const row = projectMonth(
      { ...input, params: { ...input.params, annualReturn: found.rate } },
      month,
    );
    const gap = strategy(row, 'termInvest').inHand.value - strategy(row, 'keep').inHand.value;
    expect(Math.abs(gap)).toBeLessThan(1);
    expect(found.above).toBe('termInvest');

    // A proposed contract whose table promises far more than the premiums could earn.
    const richContract = quote({
      permanent: {
        inForce: false,
        cashValueNow: 0,
        anchors: [{ age: 40, guaranteed: null, projected: 1_000_000 }],
      },
    });
    expect(breakEvenReturn(richContract, month)).toEqual({
      kind: 'always',
      ahead: 'keep',
      upTo: 0.15,
    });
    expect(breakEvenReturn(input, 0)).toBeNull();
  });

  it('invests the cash value on the term side when the contract is already in force', () => {
    const inForce = quote({
      permanent: { inForce: true, cashValueNow: 48_000, premiumYearsRemaining: 0, anchors: [] },
      term: { premium: 190, periodicity: 'month', deathBenefit: 100_000, durationYears: 10 },
      params: { annualReturn: 0.04, reinvestShare: 1, extraSavingsMonthly: 0, account: 'tfsa' },
    });
    // Today both options hold the same amount: the cash value, or the same sum invested.
    const today = projectMonth(inForce, 0);
    expect(strategy(today, 'termInvest').inHand.value).toBe(48_000);
    expect(strategy(today, 'keep').inHand.value).toBe(48_000);
    expect(project(inForce, 2026).assumptions.surrender).toBe(48_000);

    // The term costs more every month: only the cash value is invested, and it grows.
    const later = strategy(projectMonth(inForce, 120), 'termInvest').alive;
    expect(later.value).toBeCloseTo(48_000 * Math.pow(1.04, 10), 5);
    expect(later.formulaId).toBe('formula.gap.term.surrenderOnly');
    expect(later.params['surrender']).toBe(48_000);

    // An RRSP adds the refund to the lump, as to every deposit, and taxes it on the way out.
    const rrsp = quote({
      permanent: { inForce: true, cashValueNow: 10_000, anchors: [] },
      params: { annualReturn: 0, account: 'rrsp', taxRate: 0.5, taxRateLater: 0.5 },
    });
    expect(strategy(projectMonth(rrsp, 0), 'termInvest').inHand.value).toBeCloseTo(10_000, 5);

    // A proposed contract puts nothing on the term side at the start.
    const proposed = quote({ permanent: { inForce: false, cashValueNow: 48_000 } });
    expect(strategy(projectMonth(proposed, 0), 'termInvest').inHand.value).toBe(0);
    expect(project(proposed, 2026).assumptions.surrender).toBe(0);
  });

  it('reads a yearly term premium as twelve monthly payments', () => {
    const input = quote({
      term: { premium: 240, periodicity: 'year', deathBenefit: 250000, durationYears: 25 },
    });
    const row = projectMonth(input, 12);
    expect(strategy(row, 'termInvest').cost.value).toBeCloseTo(240, 5);
    expect(strategy(row, 'termInvest').cost.formulaId).toBe('formula.cost.term.year');
  });

  it('uses a guaranteed value as the projection when no projected value is entered', () => {
    const input = quote({
      profile: { currentAge: 30, horizonAge: 70 },
      permanent: {
        premium: 100,
        periodicity: 'month',
        deathBenefit: 100000,
        cashValueNow: 1000,
        premiumYearsRemaining: 20,
        projectedGrowth: 0,
        anchors: [{ age: 60, guaranteed: 50000, projected: null }],
      },
    });
    const atSixty = strategy(projectMonth(input, 360), 'keep');
    expect(atSixty.alive.value).toBeCloseTo(50000, 5);
    expect(atSixty.aliveGuaranteed?.value).toBeCloseTo(50000, 5);
    const atForty = strategy(projectMonth(input, 120), 'keep');
    expect(atForty.alive.value).toBeGreaterThan(1000);
    expect(project(input, 2026).assumptions.cashScale).toBe(true);
  });

  it('keeps today’s cash value when a row at the same age has only a guaranteed value', () => {
    const input = quote({
      profile: { currentAge: 30, horizonAge: 70 },
      permanent: {
        cashValueNow: 1000,
        anchors: [
          { age: 30, guaranteed: 0, projected: null },
          { age: 50, guaranteed: 15000, projected: 25000 },
        ],
      },
    });
    const today = strategy(projectMonth(input, 0), 'keep');
    expect(today.alive.value).toBeCloseTo(1000, 5);
    expect(today.aliveGuaranteed?.value).toBeCloseTo(0, 5);

    const unknown = quote({
      profile: { currentAge: 30, horizonAge: 70 },
      permanent: { cashValueNow: 0, anchors: [{ age: 30, guaranteed: 500, projected: null }] },
    });
    expect(strategy(projectMonth(unknown, 0), 'keep').alive.value).toBeCloseTo(500, 5);
  });

  it('adds the invested money to what you have in hand and to what your heirs receive', () => {
    const input = quote({
      profile: { currentAge: 30, horizonAge: 70 },
      params: { annualReturn: 0.04, account: 'taxable', extraSavingsMonthly: 50 },
    });
    for (const month of [60, 240, 300, 480]) {
      const row = projectMonth(input, month);
      const keep = strategy(row, 'keep');
      const term = strategy(row, 'termInvest');
      const keepSavings = keep.gapSavings?.value ?? 0;
      expect(keep.inHand.value).toBeCloseTo(keep.alive.value + keepSavings, 6);
      expect(keep.inHandGuaranteed?.value).toBeCloseTo(
        (keep.aliveGuaranteed?.value ?? 0) + keepSavings,
        6,
      );
      expect(keep.forHeirs.value).toBeCloseTo(keep.deathBenefit.value + keepSavings, 6);
      expect(keep.forHeirsProjected?.value).toBeCloseTo(
        (keep.deathBenefitProjected?.value ?? 0) + keepSavings,
        6,
      );
      expect(term.inHand.value).toBeCloseTo(term.alive.value, 6);
      expect(term.forHeirs.value).toBeCloseTo(term.deathBenefit.value + term.alive.value, 6);
    }

    // At the end of the term, the heirs still receive the invested money.
    const end = strategy(projectMonth(input, 25 * 12), 'termInvest');
    expect(end.deathBenefit.value).toBe(0);
    expect(end.forHeirs.value).toBeGreaterThan(0);
    expect(end.forHeirs.value).toBeCloseTo(end.alive.value, 6);
    expect(end.forHeirs.formulaId).toBe('formula.forHeirs.termEnded');

    const real = quote({ ...input, params: { ...input.params, realDollars: true } });
    const factor = Math.pow(1.02, -20);
    const nominalKeep = strategy(projectMonth(input, 240), 'keep');
    const realKeep = strategy(projectMonth(real, 240), 'keep');
    expect(realKeep.forHeirs.value).toBeCloseTo(nominalKeep.forHeirs.value * factor, 6);
    expect(realKeep.inHand.value).toBeCloseTo(nominalKeep.inHand.value * factor, 6);
  });

  it('draws each chart from the same totals as the summary', () => {
    const projection = project(quote({ params: { extraSavingsMonthly: 50 } }), 2026);
    const ids = projection.series.map((item) => item.id);
    expect(ids).toEqual([
      'keepHeirs',
      'keepHeirsProjected',
      'termHeirs',
      'keepInHand',
      'keepInHandGuaranteed',
      'extra',
      'termInHand',
    ]);
    const byId = new Map(projection.series.map((item) => [item.id, item]));
    const at = (id: SeriesId, month: number) =>
      byId.get(id)!.points.find((item) => item.month === month)?.value;
    for (const row of projection.years) {
      const keep = strategy(row.strategies, 'keep');
      const term = strategy(row.strategies, 'termInvest');
      expect(at('keepHeirs', row.month)).toBe(keep.forHeirs.value);
      expect(at('termHeirs', row.month)).toBe(term.forHeirs.value);
      expect(at('keepInHand', row.month)).toBe(keep.inHand.value);
      expect(at('termInHand', row.month)).toBe(term.inHand.value);
    }

    // The death chart also has the term's last month, so its end is a drop, not a slope.
    const lastMonth = 25 * 12 - 1;
    expect(projection.beforeTermEnd?.month).toBe(lastMonth);
    const lastTerm = strategy(projection.beforeTermEnd!.strategies, 'termInvest');
    expect(at('termHeirs', lastMonth)).toBe(lastTerm.forHeirs.value);
    expect(lastTerm.deathBenefit.value).toBe(250000);
    expect(at('termInHand', lastMonth)).toBeUndefined();
    // Solid: the totals. Dashed: a variant of the permanent.
    expect(projection.series.filter((item) => item.dashed).map((item) => item.id)).toEqual([
      'keepHeirsProjected',
      'keepInHandGuaranteed',
    ]);
  });

  it('drops the invested difference to zero at 0% and to half at 50%', () => {
    const shared = {
      profile: { currentAge: 40, horizonAge: 55 },
      permanent: {
        premium: 100,
        periodicity: 'month' as const,
        deathBenefit: 50000,
        cashValueNow: 0,
        premiumYearsRemaining: 20,
        projectedGrowth: 0,
        anchors: [],
      },
      term: {
        premium: 40,
        periodicity: 'month' as const,
        deathBenefit: 200000,
        durationYears: 10 as const,
      },
    };
    const none = quote({
      ...shared,
      params: { annualReturn: 0.06, reinvestShare: 0, extraSavingsMonthly: 25 },
    });
    const half = quote({
      ...shared,
      params: { annualReturn: 0, reinvestShare: 0.5, extraSavingsMonthly: 0 },
    });
    const atNone = projectMonth(none, 12);
    expect(strategy(atNone, 'termInvest').alive.value).toBe(0);
    expect(strategy(atNone, 'termInvest').extraSavings.value).toBeGreaterThan(0);
    expect(strategy(atNone, 'termInvest').aliveCombined.value).toBeCloseTo(
      strategy(atNone, 'termInvest').extraSavings.value,
      5,
    );
    expect(strategy(atNone, 'keep').alive.value).toBe(0);
    expect(strategy(atNone, 'keep').gapSavings).toBeNull();
    expect(strategy(projectMonth(half, 10), 'termInvest').alive.value).toBeCloseTo(300, 5);
  });

  it('keeps extra savings out of the primary alive figure', () => {
    const input = quote({
      profile: { currentAge: 40, horizonAge: 55 },
      permanent: {
        premium: 100,
        periodicity: 'month',
        deathBenefit: 50000,
        cashValueNow: 1000,
        premiumYearsRemaining: 20,
        projectedGrowth: 0,
        anchors: [],
      },
      term: { premium: 40, periodicity: 'month', deathBenefit: 200000, durationYears: 10 },
      params: { annualReturn: 0, reinvestShare: 1, extraSavingsMonthly: 10 },
    });
    const row = projectMonth(input, 2);
    const term = strategy(row, 'termInvest');
    const keep = strategy(row, 'keep');
    // The example's contract is in force: its 1 000 $ of cash value, then 60 $ a month.
    expect(term.alive.value).toBeCloseTo(1120, 5);
    expect(term.extraSavings.value).toBeCloseTo(20, 5);
    expect(term.aliveCombined.value).toBeCloseTo(1140, 5);
    expect(keep.alive.value).toBeCloseTo(1000, 5);
    expect(keep.aliveCombined.value).toBeCloseTo(1020, 5);
  });

  it('omits age 65 when already past it and stretches the horizon to the term', () => {
    const older = quote({
      profile: { currentAge: 70, horizonAge: 0 },
      term: { premium: 20, periodicity: 'month', deathBenefit: 100000, durationYears: 10 },
    });
    const olderProjection = project(older, 2026);
    expect(olderProjection.milestones.some((item) => item.kinds.includes('age65'))).toBe(false);
    expect(olderProjection.horizonAge).toBe(110);

    // Age + 40 would reach 111: the default stops at the field's maximum.
    const oldest = quote({
      profile: { currentAge: 71, horizonAge: 0 },
      term: { premium: 20, periodicity: 'month', deathBenefit: 100000, durationYears: 10 },
    });
    expect(project(oldest, 2026).horizonAge).toBe(110);
    expect(defaultHorizonAge(100, 10)).toBe(110);

    const short = quote({ profile: { currentAge: 30, horizonAge: 40 } });
    const shortProjection = project(short, 2026);
    expect(shortProjection.horizonAge).toBe(55);
    expect(
      shortProjection.milestones.some((item) => item.kinds.includes('termEnd') && item.age === 55),
    ).toBe(true);
  });

  it('shows the year before the end of the term, while it still pays', () => {
    const projection = project(exampleScenario(), 2026);
    const before = projection.milestones.find((item) => item.kinds.includes('beforeTermEnd'));
    expect(before?.age).toBe(projection.termEndAge - 1);
    expect(strategy(before!.strategies, 'termInvest').deathBenefit.value).toBe(250_000);
    const end = projection.milestones.find((item) => item.kinds.includes('termEnd'));
    expect(strategy(end!.strategies, 'termInvest').deathBenefit.value).toBe(0);
  });

  it('explains every amount of the example with the catalog operands', () => {
    const projection = project(exampleScenario(), 2026);
    expect(projection.milestones.map((item) => item.kinds)).toEqual([
      ['beforeTermEnd'],
      ['termEnd'],
      ['age65'],
      ['horizon'],
    ]);
    for (const year of projection.years) {
      for (const item of year.strategies) {
        const amounts = [
          item.cost,
          item.deathBenefit,
          item.deathBenefitProjected,
          item.alive,
          item.aliveGuaranteed,
          item.gapSavings,
          item.extraSavings,
          item.aliveCombined,
          item.inHand,
          item.inHandGuaranteed,
          item.forHeirs,
          item.forHeirsProjected,
        ];
        for (const amount of amounts) {
          if (!amount) continue;
          expect(fr).toHaveProperty(amount.formulaId);
          expect(amount.params['value']).toBe(amount.value);
          const text = explain(
            amount.formulaId,
            amount.params,
            (key) => fr[key as keyof typeof fr],
          );
          expect(text.length).toBeGreaterThan(10);
          expect(text).not.toBe(amount.formulaId);
        }
      }
    }
  });
});
