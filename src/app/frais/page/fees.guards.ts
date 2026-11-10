import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeesStore } from '../state/fees.store';

export const feesComparisonGuard: CanActivateFn = () => {
  if (inject(FeesStore).finished()) return true;
  return inject(Router).createUrlTree(['/frais']);
};

/**
 * Someone who went through the steps goes straight to the results, past the introduction;
 * someone halfway through goes back to the steps.
 */
export const feesWelcomeGuard: CanActivateFn = () => {
  const store = inject(FeesStore);
  const router = inject(Router);
  if (store.finished()) return router.createUrlTree(['/frais/comparaison']);
  if (store.started()) return router.createUrlTree(['/frais/profil']);
  return true;
};
