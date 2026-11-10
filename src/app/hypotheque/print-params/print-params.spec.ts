import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { formatMoneyExact } from '../../shared/engine/formulas';
import { MortgageStore } from '../state/mortgage.store';
import { MortgagePrintParams } from './print-params';

describe('MortgagePrintParams', () => {
  beforeEach(() => localStorage.clear());

  it('lists one term policy per person, under each name', () => {
    const store = TestBed.inject(MortgageStore);
    const edited = structuredClone(store.draft());
    edited.couple = true;
    edited.people.p2.label = 'Sam';
    store.edit(edited);

    const groups = TestBed.createComponent(MortgagePrintParams).componentInstance.groups();
    expect(groups.map((group) => group.title)).toEqual([
      'Votre prêt',
      'L’assurance de la banque',
      'Temporaire de Personne 1',
      'Temporaire de Sam',
    ]);
    expect(groups[1].rows[0].value).toBe(formatMoneyExact(40));
  });
});
