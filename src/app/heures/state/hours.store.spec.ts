import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultWorkForm, toWorkInput } from '../engine/blank';
import { HoursStore } from './hours.store';

describe('HoursStore', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the last complete figures when an edit empties the pay', () => {
    const store = TestBed.inject(HoursStore);
    const before = store.committed();

    store.edit({ ...store.draft(), salary: null });
    expect(store.committed()).toEqual(before);
    expect(store.missing()).toEqual(['salary']);

    store.edit({ ...store.draft(), salary: 2_400 });
    expect(store.committed().salary).toBe(2_400);
  });

  it('finds the saved figures again on the next visit', () => {
    const store = TestBed.inject(HoursStore);
    store.edit({ ...store.draft(), price: 25, recurrence: 'month' });
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(HoursStore);
    expect(next.committed()).toMatchObject({ price: 25, recurrence: 'month' });
  });

  it('goes back to the starting figures on reset', () => {
    const store = TestBed.inject(HoursStore);
    store.edit({ ...store.draft(), workCosts: 300 });
    store.reset();
    expect(store.draft()).toEqual(defaultWorkForm());
    expect(store.committed()).toEqual(toWorkInput(defaultWorkForm()));
  });
});
