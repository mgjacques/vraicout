import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultSavingsForm, toSavingsInput } from '../engine/blank';
import { SavingsStore } from './savings.store';

describe('SavingsStore', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the last complete figures when an edit empties the deposit', () => {
    const store = TestBed.inject(SavingsStore);
    const before = store.committed();

    store.edit({ ...store.draft(), monthly: null });
    expect(store.committed()).toEqual(before);
    expect(store.missing()).toEqual(['amount']);

    store.edit({ ...store.draft(), monthly: 250 });
    expect(store.committed().monthly).toBe(250);
  });

  it('finds the saved figures again on the next visit', () => {
    const store = TestBed.inject(SavingsStore);
    store.edit({ ...store.draft(), monthly: 92, annualReturn: 0.07, realDollars: true });
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(SavingsStore);
    expect(next.committed()).toMatchObject({ monthly: 92, annualReturn: 0.07, realDollars: true });
  });

  it('goes back to the starting figures on reset', () => {
    const store = TestBed.inject(SavingsStore);
    store.edit({ ...store.draft(), initial: 5_000, delayYears: null });
    store.reset();
    expect(store.draft()).toEqual(defaultSavingsForm());
    expect(store.committed()).toEqual(toSavingsInput(defaultSavingsForm()));
  });
});
