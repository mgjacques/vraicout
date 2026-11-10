import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultSpendingForm, toSpendingInput } from '../engine/blank';
import { SpendingStore } from './spending.store';

describe('SpendingStore', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the last complete figures when an edit empties the amount', () => {
    const store = TestBed.inject(SpendingStore);
    const before = store.committed();

    store.edit({ ...store.draft(), amount: null });
    expect(store.committed()).toEqual(before);
    expect(store.missing()).toEqual(['amount']);

    store.edit({ ...store.draft(), amount: 12 });
    expect(store.committed().amount).toBe(12);
  });

  it('finds the saved figures again on the next visit', () => {
    const store = TestBed.inject(SpendingStore);
    store.edit({ ...store.draft(), count: 2, cadence: 'everyWeeks' });
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(SpendingStore);
    expect(next.committed()).toMatchObject({ count: 2, cadence: 'everyWeeks' });
  });

  it('goes back to the starting figures on reset', () => {
    const store = TestBed.inject(SpendingStore);
    store.edit({ ...store.draft(), years: 30, priceGrowth: true });
    store.reset();
    expect(store.draft()).toEqual(defaultSpendingForm());
    expect(store.committed()).toEqual(toSpendingInput(defaultSpendingForm()));
  });
});
