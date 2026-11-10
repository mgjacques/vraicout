import { Periodicity, ScenarioInput, TermDuration, ValueAnchor } from './types';
import { RETURN_MARKERS } from './limits';

/** How the person gives their age. */
export type AgeBy = 'age' | 'birthYear';

/** How the rows of the contract's value table are located: attained age, calendar year, or policy year (1, 2, 3…). */
export type AnchorsBy = 'age' | 'year' | 'policyYear';

/** A row of the contract's value table, located in the unit the person chose. */
export interface FormAnchor {
  at: number;
  /** Set when the row could not be rewritten in the new unit yet (policy years before the start year is known). */
  pendingAge?: number;
  guaranteed: number | null;
  projected: number | null;
}

/** Fields the profile page can leave empty. Null means the person has not typed a value. */
export interface ScenarioForm {
  profile: {
    /** Always kept up to date, also when the person gives a birth year. */
    currentAge: number | null;
    ageBy: AgeBy;
    birthYear: number | null;
    horizonAge: number | null;
  };
  permanent: {
    premium: number | null;
    periodicity: Periodicity;
    deathBenefit: number | null;
    /** Already in force, or an illustration someone proposes. Only a contract in force has a cash value today. */
    inForce: boolean;
    cashValueNow: number | null;
    premiumYearsRemaining: number | null;
    projectedGrowth: number;
    anchorsBy: AnchorsBy;
    /** Year the contract started; needed only to read policy years. */
    contractStartYear: number | null;
    anchors: FormAnchor[];
  };
  term: {
    premium: number | null;
    periodicity: Periodicity;
    deathBenefit: number | null;
    durationYears: TermDuration;
  };
  params: ScenarioInput['params'];
}

/** Fields without which the comparison means nothing. */
export type RequiredField =
  'age' | 'premium' | 'face' | 'years' | 'contractStart' | 'termPremium' | 'termFace';

export function thisYear(): number {
  return new Date().getFullYear();
}

/**
 * Age at a table row. A calendar year or a policy year is read against today's age,
 * so it is exact to within a year (it depends on the birthday and the contract date).
 * The end of policy year n falls in the start year + n.
 */
export function anchorAge(form: ScenarioForm, at: number, year = thisYear()): number | null {
  const age = form.profile.currentAge;
  const mode = form.permanent.anchorsBy;
  if (mode === 'age') return at;
  if (age === null) return null;
  if (mode === 'year') return age + (at - year);
  const start = plausibleStart(form.permanent.contractStartYear, year);
  return start === null ? null : age + (start + at - year);
}

/** A start year still being typed ("2", "20"…) or out of range counts as missing. */
export function plausibleStart(start: number | null, year = thisYear()): number | null {
  return start !== null && start >= year - 100 && start <= year ? start : null;
}

/** Age of a row, including one still waiting for the contract start year. */
export function rowAge(form: ScenarioForm, anchor: FormAnchor, year = thisYear()): number | null {
  return anchor.pendingAge ?? anchorAge(form, anchor.at, year);
}

/** The inverse of anchorAge: where a row at this age sits in a given unit. */
export function anchorAt(
  form: ScenarioForm,
  age: number,
  mode: AnchorsBy,
  year = thisYear(),
): number | null {
  const current = form.profile.currentAge;
  if (mode === 'age') return age;
  if (current === null) return null;
  if (mode === 'year') return year + (age - current);
  const start = plausibleStart(form.permanent.contractStartYear, year);
  return start === null ? null : year + (age - current) - start;
}

/** Starting return: the bond marker of the risk scale, shown on the comparison so it is never silent. */
export const DEFAULT_RETURN = RETURN_MARKERS.bonds / 100;

/**
 * Starting marginal tax rate: the combined federal and Quebec rate on taxable income from
 * 58 523 $ to 108 680 $ in 2026 (36,12 %), rounded. Only used outside a TFSA.
 */
export const DEFAULT_TAX_RATE = 0.36;

export function blankForm(): ScenarioForm {
  return {
    profile: { currentAge: null, ageBy: 'age', birthYear: null, horizonAge: null },
    permanent: {
      premium: null,
      periodicity: 'month',
      deathBenefit: null,
      inForce: false,
      cashValueNow: null,
      premiumYearsRemaining: null,
      projectedGrowth: 0,
      anchorsBy: 'age',
      contractStartYear: null,
      anchors: [],
    },
    term: {
      premium: null,
      periodicity: 'month',
      deathBenefit: null,
      durationYears: 20,
    },
    params: {
      annualReturn: DEFAULT_RETURN,
      reinvestShare: 1,
      extraSavingsMonthly: 0,
      account: 'tfsa',
      taxRate: DEFAULT_TAX_RATE,
      taxRateLater: DEFAULT_TAX_RATE,
      realDollars: false,
      inflation: 0.02,
    },
  };
}

export function missingFields(form: ScenarioForm): RequiredField[] {
  const missing: RequiredField[] = [];
  const age = form.profile.currentAge;
  if (age === null || age < 1) missing.push('age');
  if (form.permanent.premium === null) missing.push('premium');
  if (form.permanent.deathBenefit === null) missing.push('face');
  if (form.permanent.premiumYearsRemaining === null) missing.push('years');
  if (
    form.permanent.anchorsBy === 'policyYear' &&
    form.permanent.anchors.length > 0 &&
    plausibleStart(form.permanent.contractStartYear) === null
  ) {
    missing.push('contractStart');
  }
  if (form.term.premium === null) missing.push('termPremium');
  if (form.term.deathBenefit === null) missing.push('termFace');
  return missing;
}

export function profileReady(form: ScenarioForm): boolean {
  return missingFields(form).length === 0;
}

export function toScenarioInput(form: ScenarioForm): ScenarioInput {
  return {
    profile: {
      currentAge: form.profile.currentAge ?? 0,
      horizonAge: form.profile.horizonAge ?? 0,
    },
    permanent: {
      premium: form.permanent.premium ?? 0,
      periodicity: form.permanent.periodicity,
      deathBenefit: form.permanent.deathBenefit ?? 0,
      inForce: form.permanent.inForce,
      // The field is hidden for a proposed contract: a value typed before switching is not used.
      cashValueNow: form.permanent.inForce ? (form.permanent.cashValueNow ?? 0) : 0,
      premiumYearsRemaining: form.permanent.premiumYearsRemaining ?? 0,
      projectedGrowth: form.permanent.projectedGrowth,
      anchors: form.permanent.anchors.flatMap((anchor): ValueAnchor[] => {
        const age = rowAge(form, anchor);
        return age === null
          ? []
          : [{ age, guaranteed: anchor.guaranteed, projected: anchor.projected }];
      }),
    },
    term: {
      premium: form.term.premium ?? 0,
      periodicity: form.term.periodicity,
      deathBenefit: form.term.deathBenefit ?? 0,
      durationYears: form.term.durationYears,
    },
    params: { ...form.params },
  };
}

export function toForm(input: ScenarioInput): ScenarioForm {
  return {
    profile: {
      currentAge: input.profile.currentAge,
      ageBy: 'age',
      birthYear: null,
      horizonAge: input.profile.horizonAge > 0 ? input.profile.horizonAge : null,
    },
    permanent: {
      premium: input.permanent.premium,
      periodicity: input.permanent.periodicity,
      deathBenefit: input.permanent.deathBenefit,
      inForce: input.permanent.inForce,
      cashValueNow: input.permanent.cashValueNow,
      premiumYearsRemaining: input.permanent.premiumYearsRemaining,
      projectedGrowth: input.permanent.projectedGrowth,
      anchorsBy: 'age',
      contractStartYear: null,
      anchors: input.permanent.anchors.map((anchor) => ({
        at: anchor.age,
        guaranteed: anchor.guaranteed,
        projected: anchor.projected,
      })),
    },
    term: { ...input.term },
    params: { ...input.params },
  };
}
