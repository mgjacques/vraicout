import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultFeesForm } from '../engine/blank';
import { FeesStore } from './fees.store';

describe('FeesStore', () => {
  beforeEach(() => localStorage.clear());

  it('finds the saved figures again on the next visit', () => {
    const store = TestBed.inject(FeesStore);
    const edited = structuredClone(store.draft());
    edited.portfolios.a.mer = 0.018;
    store.edit(edited);
    TestBed.tick();

    TestBed.resetTestingModule();
    expect(TestBed.inject(FeesStore).committed().portfolios.a.mer).toBe(0.018);
  });

  it('keeps the last complete figures when an edit empties a required field', () => {
    const store = TestBed.inject(FeesStore);
    const before = store.committed();

    const emptied = structuredClone(store.draft());
    emptied.portfolios.a.mer = null;
    store.edit(emptied);
    expect(store.committed()).toEqual(before);
    expect(store.missing()).toEqual(['merA']);

    const fixed = structuredClone(store.draft());
    fixed.portfolios.a.mer = 0.015;
    store.edit(fixed);
    expect(store.committed().portfolios.a.mer).toBe(0.015);
    expect(store.missing()).toEqual([]);
  });

  it('starts a first visit on the introduction, and resumes at the step left', () => {
    const store = TestBed.inject(FeesStore);
    expect(store.finished()).toBe(false);
    expect(store.started()).toBe(false);
    store.profileStep.set(3);
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(FeesStore);
    expect(next.profileStep()).toBe(3);
    expect(next.started()).toBe(true);
    expect(next.finished()).toBe(false);
  });

  it('goes back to the starting figures and the introduction on reset', () => {
    const store = TestBed.inject(FeesStore);
    const edited = structuredClone(store.draft());
    edited.years = 12;
    store.edit(edited);
    store.profileStep.set(4);
    store.finish();

    store.reset();
    expect(store.draft()).toEqual(defaultFeesForm());
    expect(store.finished()).toBe(false);
    expect(store.started()).toBe(false);
  });
});
