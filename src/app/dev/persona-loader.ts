import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { ScenarioStore } from '../assurance/state/scenario.store';
import { FeesStore } from '../frais/state/fees.store';
import { HoursStore } from '../heures/state/hours.store';
import { MortgageStore } from '../hypotheque/state/mortgage.store';
import { SplitStore } from '../partage/state/split.store';
import { PERSONAS, Persona } from './personas';

/**
 * Development only: `?persona=lucie` on any page fills every tool with that persona's
 * figures before the first navigation, then drops the parameter from the address.
 * The production build swaps this file for persona-loader.prod.ts (angular.json).
 */
export function providePersonaLoader(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const url = new URL(globalThis.location.href);
    const id = url.searchParams.get('persona');
    if (id === null) return;
    url.searchParams.delete('persona');
    globalThis.history.replaceState(globalThis.history.state, '', url);
    const persona = PERSONAS[id];
    if (!persona) {
      console.warn(`Persona inconnu : ${id}. Choix : ${Object.keys(PERSONAS).join(', ')}`);
      return;
    }
    loadPersona(persona, {
      insurance: inject(ScenarioStore),
      fees: inject(FeesStore),
      mortgage: inject(MortgageStore),
      split: inject(SplitStore),
      hours: inject(HoursStore),
    });
    console.info(`Persona chargé : ${persona.name}`);
  });
}

interface Stores {
  insurance: ScenarioStore;
  fees: FeesStore;
  mortgage: MortgageStore;
  split: SplitStore;
  hours: HoursStore;
}

/**
 * Every tool starts again from its first visit, then takes the persona's figures, so
 * nothing from a previous persona is left behind. A complete form opens on the results.
 */
export function loadPersona(persona: Persona, stores: Stores): void {
  const { insurance, fees, mortgage, split, hours } = stores;
  insurance.reset();
  fees.reset();
  mortgage.reset();
  split.reset();
  hours.reset();

  if (persona.insurance) {
    insurance.draft.set(structuredClone(persona.insurance));
    // Incomplete on purpose (Alex): the profile opens with the missing fields marked.
    if (insurance.commitDraft()) insurance.profileStep.set(4);
  }
  if (persona.fees) {
    fees.edit(structuredClone(persona.fees));
    fees.finish();
  }
  if (persona.mortgage) {
    mortgage.edit(structuredClone(persona.mortgage));
    mortgage.finish();
  }
  if (persona.split) split.edit(structuredClone(persona.split));
  if (persona.hours) hours.edit(structuredClone(persona.hours));
}
