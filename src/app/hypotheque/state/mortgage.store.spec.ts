import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultMortgageForm } from '../engine/blank';
import { MortgageStore } from './mortgage.store';

describe('MortgageStore', () => {
  beforeEach(() => localStorage.clear());

  it('finds the saved figures and the chosen year again on the next visit', () => {
    const store = TestBed.inject(MortgageStore);
    const edited = structuredClone(store.draft());
    edited.bankPremium = 52;
    store.edit(edited);
    store.deathYear.set(7);
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(MortgageStore);
    expect(next.committed().bankPremium).toBe(52);
    expect(next.year()).toBe(7);
  });

  it('keeps the last complete figures when an edit empties a required field', () => {
    const store = TestBed.inject(MortgageStore);
    const before = store.committed();

    const emptied = structuredClone(store.draft());
    emptied.loan.amount = null;
    store.edit(emptied);
    expect(store.committed()).toEqual(before);
    expect(store.missing()).toEqual(['loanAmount']);

    const fixed = structuredClone(store.draft());
    fixed.loan.amount = 400_000;
    store.edit(fixed);
    expect(store.committed().loan.amount).toBe(400_000);
    expect(store.missing()).toEqual([]);
  });

  it('looks at the middle of the loan by default, and keeps the chosen year within it', () => {
    const store = TestBed.inject(MortgageStore);
    expect(store.year()).toBe(13);
    store.deathYear.set(30);
    expect(store.year()).toBe(25);
  });

  it('starts a first visit on the introduction, and resumes at the step left', () => {
    const store = TestBed.inject(MortgageStore);
    expect(store.finished()).toBe(false);
    expect(store.started()).toBe(false);
    store.profileStep.set(2);
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(MortgageStore);
    expect(next.profileStep()).toBe(2);
    expect(next.started()).toBe(true);
  });

  it('goes back to the starting figures and the introduction on reset', () => {
    const store = TestBed.inject(MortgageStore);
    const edited = structuredClone(store.draft());
    edited.couple = true;
    store.edit(edited);
    store.deathPerson.set('p2');
    store.profileStep.set(3);
    store.finish();

    store.reset();
    expect(store.draft()).toEqual(defaultMortgageForm());
    expect(store.finished()).toBe(false);
    expect(store.started()).toBe(false);
    expect(store.deathPerson()).toBe('p1');
  });
});
