import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MortgageStore } from '../state/mortgage.store';

export const mortgageComparisonGuard: CanActivateFn = () => {
  if (inject(MortgageStore).finished()) return true;
  return inject(Router).createUrlTree(['/hypotheque']);
};

/**
 * Someone who went through the steps goes straight to the results, past the introduction;
 * someone halfway through goes back to the steps.
 */
export const mortgageWelcomeGuard: CanActivateFn = () => {
  const store = inject(MortgageStore);
  const router = inject(Router);
  if (store.finished()) return router.createUrlTree(['/hypotheque/comparaison']);
  if (store.started()) return router.createUrlTree(['/hypotheque/profil']);
  return true;
};
