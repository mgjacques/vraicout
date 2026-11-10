import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FeesStore } from '../state/fees.store';
import { FeesPrintParams } from './print-params';

describe('FeesPrintParams', () => {
  beforeEach(() => localStorage.clear());

  it('lists the figures the reader entered, with each portfolio’s fees', () => {
    const store = TestBed.inject(FeesStore);
    const edited = structuredClone(store.draft());
    edited.portfolios.a.mer = 0.0185;
    edited.portfolios.a.label = 'Fonds commun';
    store.edit(edited);

    const groups = TestBed.createComponent(FeesPrintParams).componentInstance.groups();
    const a = groups.find((group) => group.title.includes('Fonds commun'))!;
    expect(a.title).toBe('Placement A : Fonds commun');
    expect(a.rows[0].value).toBe('1,85\u00a0%');
  });
});
