import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ScenarioStore } from './scenario.store';

describe('ScenarioStore', () => {
  beforeEach(() => localStorage.clear());

  it('finds the saved scenario again on the next visit', () => {
    const store = TestBed.inject(ScenarioStore);
    store.useExample();
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(ScenarioStore);
    expect(next.committed()).toEqual(store.committed());
    expect(next.illustrative()).toBe(true);
  });

  it('keeps the last complete scenario when a live edit empties a required field', () => {
    const store = TestBed.inject(ScenarioStore);
    store.useExample();
    const before = store.committed();

    const emptied = structuredClone(store.draft());
    emptied.profile.currentAge = null;
    store.edit(emptied, true);
    expect(store.committed()).toEqual(before);
    expect(store.missing()).toEqual(['age']);

    const fixed = structuredClone(store.draft());
    fixed.profile.currentAge = 41;
    store.edit(fixed, true);
    expect(store.committed()?.profile.currentAge).toBe(41);
    expect(store.illustrative()).toBe(false);
  });

  it('refuses to commit an incomplete profile and remembers the attempt', () => {
    const store = TestBed.inject(ScenarioStore);
    expect(store.commitDraft()).toBe(false);
    expect(store.attempted()).toBe(true);
    expect(store.committed()).toBeNull();
  });

  it('remembers the profile step on the next visit', () => {
    const store = TestBed.inject(ScenarioStore);
    expect(store.started()).toBe(false);
    store.profileStep.set(3);
    TestBed.tick();

    TestBed.resetTestingModule();
    const next = TestBed.inject(ScenarioStore);
    expect(next.profileStep()).toBe(3);
    expect(next.started()).toBe(true);
  });

  it('starts again from an empty form on reset', () => {
    const store = TestBed.inject(ScenarioStore);
    store.useExample();
    store.reset();
    expect(store.committed()).toBeNull();
    expect(store.illustrative()).toBe(false);
    expect(store.draftReady()).toBe(false);
    expect(store.started()).toBe(false);
  });
});
