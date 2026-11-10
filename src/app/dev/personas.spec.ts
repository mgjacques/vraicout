import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { missingFields } from '../assurance/engine/blank';
import { ScenarioStore } from '../assurance/state/scenario.store';
import { missingSpendingFields } from '../depenses/engine/blank';
import { SpendingStore } from '../depenses/state/spending.store';
import { defaultSavingsForm, missingSavingsFields } from '../epargne/engine/blank';
import { SavingsStore } from '../epargne/state/savings.store';
import { missingFeesFields } from '../frais/engine/blank';
import { FeesStore } from '../frais/state/fees.store';
import { missingWorkFields } from '../heures/engine/blank';
import { HoursStore } from '../heures/state/hours.store';
import { missingMortgageFields } from '../hypotheque/engine/blank';
import { MortgageStore } from '../hypotheque/state/mortgage.store';
import { missingMarginalFields } from '../impot/engine/blank';
import { MarginalStore } from '../impot/state/marginal.store';
import { missingSplitFields } from '../partage/engine/blank';
import { SplitStore } from '../partage/state/split.store';
import { loadPersona } from './persona-loader';
import { INCOMPLETE, PERSONAS } from './personas';

function stores() {
  return {
    insurance: TestBed.inject(ScenarioStore),
    fees: TestBed.inject(FeesStore),
    mortgage: TestBed.inject(MortgageStore),
    split: TestBed.inject(SplitStore),
    hours: TestBed.inject(HoursStore),
    spending: TestBed.inject(SpendingStore),
    savings: TestBed.inject(SavingsStore),
    marginal: TestBed.inject(MarginalStore),
  };
}

describe('personas', () => {
  beforeEach(() => localStorage.clear());

  it('fill every form they use completely, except the ones left incomplete on purpose', () => {
    for (const [id, persona] of Object.entries(PERSONAS)) {
      if (INCOMPLETE.includes(id)) continue;
      const missing = [
        ...(persona.insurance ? missingFields(persona.insurance) : []),
        ...(persona.fees ? missingFeesFields(persona.fees) : []),
        ...(persona.mortgage ? missingMortgageFields(persona.mortgage) : []),
        ...(persona.split ? missingSplitFields(persona.split) : []),
        ...(persona.hours ? missingWorkFields(persona.hours) : []),
        ...(persona.spending ? missingSpendingFields(persona.spending) : []),
        ...(persona.savings ? missingSavingsFields(persona.savings) : []),
        ...(persona.marginal ? missingMarginalFields(persona.marginal) : []),
      ];
      expect({ id, missing }).toEqual({ id, missing: [] });
    }
  });

  it('open each tool on the persona’s results, and leave the others as on a first visit', () => {
    const all = stores();
    loadPersona(PERSONAS['lucie']!, all);
    expect(all.insurance.committed()?.permanent.cashValueNow).toBe(48_000);
    expect(all.insurance.committed()?.permanent.inForce).toBe(true);
    expect(all.fees.finished()).toBe(true);
    expect(all.fees.committed().initialAmount).toBe(320_000);
    expect(all.mortgage.finished()).toBe(false);

    // A second persona replaces the first one everywhere.
    loadPersona(PERSONAS['karim-sophie']!, all);
    expect(all.insurance.committed()?.profile.currentAge).toBe(34);
    expect(all.fees.finished()).toBe(false);
    expect(all.mortgage.finished()).toBe(true);
    expect(all.split.committed().people.p1.label).toBe('Karim');
  });

  it('send the newer tools back to their starting figures when the persona does not use them', () => {
    const all = stores();
    loadPersona(PERSONAS['thomas']!, all);
    expect(all.savings.committed().delayYears).toBe(5);
    expect(all.spending.committed().priceGrowth).toBe(true);

    loadPersona(PERSONAS['camille']!, all);
    expect(all.marginal.committed().income).toBe(72_000);
    expect(all.spending.committed().amount).toBe(4.75);
    expect(all.savings.draft()).toEqual(defaultSavingsForm());
  });

  it('keep Alex on the profile, with the years of premiums missing', () => {
    const all = stores();
    loadPersona(PERSONAS['alex']!, all);
    expect(all.insurance.committed()).toBeNull();
    expect(all.insurance.missing()).toEqual(['years']);
  });
});
