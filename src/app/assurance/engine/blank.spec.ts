import { describe, expect, it } from 'vitest';
import {
  anchorAge,
  anchorAt,
  blankForm,
  missingFields,
  ScenarioForm,
  toScenarioInput,
} from './blank';

function form(): ScenarioForm {
  const draft = blankForm();
  draft.profile.currentAge = 30;
  draft.permanent.premium = 100;
  draft.permanent.deathBenefit = 100000;
  draft.permanent.premiumYearsRemaining = 20;
  draft.term.premium = 20;
  draft.term.deathBenefit = 250000;
  return draft;
}

describe('table rows located by age, year or policy year', () => {
  it('reads a calendar year against today’s age', () => {
    const draft = form();
    draft.permanent.anchorsBy = 'year';
    expect(anchorAge(draft, 2046, 2026)).toBe(50);
    expect(anchorAt(draft, 50, 'year', 2026)).toBe(2046);
  });

  it('reads a policy year from the contract start: the end of year n falls in start + n', () => {
    const draft = form();
    draft.permanent.anchorsBy = 'policyYear';
    expect(anchorAge(draft, 20, 2026)).toBeNull();
    draft.permanent.contractStartYear = 2021;
    // End of policy year 20 = 2041, 15 years from 2026, so age 45.
    expect(anchorAge(draft, 20, 2026)).toBe(45);
    expect(anchorAt(draft, 45, 'policyYear', 2026)).toBe(20);
  });

  it('asks for the contract start only when policy-year rows exist', () => {
    const draft = form();
    draft.permanent.anchorsBy = 'policyYear';
    expect(missingFields(draft)).toEqual([]);
    draft.permanent.anchors.push({ at: 20, guaranteed: 15000, projected: null });
    expect(missingFields(draft)).toEqual(['contractStart']);
    draft.permanent.contractStartYear = 20;
    expect(missingFields(draft)).toEqual(['contractStart']);
    draft.permanent.contractStartYear = 2021;
    expect(missingFields(draft)).toEqual([]);
  });

  it('gives the engine ages, whatever the unit the person typed', () => {
    const draft = form();
    draft.permanent.anchorsBy = 'year';
    const year = new Date().getFullYear();
    draft.permanent.anchors.push({ at: year + 20, guaranteed: 15000, projected: 25000 });
    expect(toScenarioInput(draft).permanent.anchors).toEqual([
      { age: 50, guaranteed: 15000, projected: 25000 },
    ]);
  });

  it('keeps a row at its age while it waits for the contract start year', () => {
    const draft = form();
    draft.permanent.anchorsBy = 'policyYear';
    draft.permanent.anchors.push({ at: 10, pendingAge: 50, guaranteed: 15000, projected: null });
    expect(toScenarioInput(draft).permanent.anchors).toEqual([
      { age: 50, guaranteed: 15000, projected: null },
    ]);
  });
});

describe('a contract already in force', () => {
  it('uses the cash value today only for a contract in force', () => {
    const draft = form();
    draft.permanent.cashValueNow = 5000;
    expect(toScenarioInput(draft).permanent.cashValueNow).toBe(0);
    expect(toScenarioInput(draft).permanent.inForce).toBe(false);

    draft.permanent.inForce = true;
    expect(toScenarioInput(draft).permanent.cashValueNow).toBe(5000);
    expect(toScenarioInput(draft).permanent.inForce).toBe(true);
  });
});
