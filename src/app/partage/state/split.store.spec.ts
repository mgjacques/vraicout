import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultSplitForm, toSplitInput } from '../engine/blank';
import { SplitStore } from './split.store';

describe('SplitStore', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the last complete figures when an edit empties a salary', () => {
    const store = TestBed.inject(SplitStore);
    const before = store.committed();

    const emptied = structuredClone(store.draft());
    emptied.people.p1.salary = null;
    store.edit(emptied);
    expect(store.committed()).toEqual(before);
    expect(store.missing()).toEqual(['salary1']);

    const fixed = structuredClone(store.draft());
    fixed.people.p1.salary = 90_000;
    store.edit(fixed);
    expect(store.committed().people.p1.salary).toBe(90_000);
  });

  it('finds the saved figures again on the next visit', () => {
    const store = TestBed.inject(SplitStore);
    const edited = structuredClone(store.draft());
    edited.people.p2.frequency = 'biweekly';
    edited.people.p2.salary = 2_100;
    store.edit(edited);
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(SplitStore);
    expect(next.committed().people.p2).toMatchObject({ frequency: 'biweekly', salary: 2_100 });
  });

  it('goes back to the starting figures on reset', () => {
    const store = TestBed.inject(SplitStore);
    const edited = structuredClone(store.draft());
    edited.bill = 1_800;
    store.edit(edited);
    store.reset();
    expect(store.draft()).toEqual(defaultSplitForm());
    expect(store.committed()).toEqual(toSplitInput(defaultSplitForm()));
  });
});
