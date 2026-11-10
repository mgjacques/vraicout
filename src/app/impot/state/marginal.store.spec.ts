import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultMarginalForm, toMarginalInput } from '../engine/blank';
import { MarginalStore } from './marginal.store';

describe('MarginalStore', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the last complete figures when an edit empties the income', () => {
    const store = TestBed.inject(MarginalStore);
    const before = store.committed();

    store.edit({ ...store.draft(), income: null });
    expect(store.committed()).toEqual(before);
    expect(store.missing()).toEqual(['income']);

    store.edit({ ...store.draft(), income: 120_000 });
    expect(store.committed().income).toBe(120_000);
  });

  it('treats an emptied extra income as none', () => {
    const store = TestBed.inject(MarginalStore);
    store.edit({ ...store.draft(), extra: null });
    expect(store.missing()).toEqual([]);
    expect(store.projection().extra).toBeNull();
  });

  it('finds the saved figures again on the next visit', () => {
    const store = TestBed.inject(MarginalStore);
    store.edit({ income: 95_000, extra: 1_200 });
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(MarginalStore);
    expect(next.committed()).toEqual({ income: 95_000, extra: 1_200 });
  });

  it('goes back to the starting figures on reset', () => {
    const store = TestBed.inject(MarginalStore);
    store.edit({ income: 40_000, extra: null });
    store.reset();
    expect(store.draft()).toEqual(defaultMarginalForm());
    expect(store.committed()).toEqual(toMarginalInput(defaultMarginalForm()));
  });
});
