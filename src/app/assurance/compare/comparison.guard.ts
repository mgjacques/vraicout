import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ScenarioStore } from '../state/scenario.store';

export const comparisonGuard: CanActivateFn = () => {
  const store = inject(ScenarioStore);
  if (store.committed()) return true;
  return inject(Router).createUrlTree(['/assurance/profil']);
};

/**
 * Someone who already has a scenario goes straight to it, past the introduction;
 * someone halfway through the profile goes back to it.
 */
export const welcomeGuard: CanActivateFn = () => {
  const store = inject(ScenarioStore);
  const router = inject(Router);
  if (store.committed()) return router.createUrlTree(['/assurance/comparaison']);
  if (store.started()) return router.createUrlTree(['/assurance/profil']);
  return true;
};
