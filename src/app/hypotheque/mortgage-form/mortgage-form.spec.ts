import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { I18nService } from '../../shared/i18n/i18n.service';
import { defaultMortgageForm } from '../engine/blank';
import { fieldLabel } from './mortgage-form';

describe('fieldLabel', () => {
  const i18n = () => TestBed.inject(I18nService);

  it('names nobody when one person is on the loan', () => {
    expect(fieldLabel(i18n(), 'termPremium1', defaultMortgageForm())).toBe(
      'la prime de la temporaire',
    );
  });

  it('names each person of a couple as the form does', () => {
    const form = { ...defaultMortgageForm(), couple: true };
    form.people = { ...form.people, p1: { ...form.people.p1, label: 'Julie' } };
    expect(fieldLabel(i18n(), 'termPremium1', form)).toBe('la prime de la temporaire de Julie');
    expect(fieldLabel(i18n(), 'termYears2', form)).toBe('la durée de la temporaire de Personne 2');
    expect(fieldLabel(i18n(), 'loanRate', form)).toBe('Taux d’intérêt du prêt');
  });
});
