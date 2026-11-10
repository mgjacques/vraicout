import { Routes } from '@angular/router';
import { MessageKey } from '../shared/i18n/fr';
import { MortgageMethod } from './method/mortgage-method';
import { mortgageComparisonGuard, mortgageWelcomeGuard } from './page/mortgage.guards';
import { MortgagePage } from './page/mortgage-page';
import { MortgageProfile } from './profile/mortgage-profile';
import { MortgageWelcome } from './welcome/mortgage-welcome';

/** Mounted under /hypotheque. */
export const HYPOTHEQUE_ROUTES: Routes = [
  {
    path: '',
    component: MortgageWelcome,
    canActivate: [mortgageWelcomeGuard],
    title: 'title.mortgageWelcome' satisfies MessageKey,
  },
  // The same page without the guard: the results link back to it.
  {
    path: 'introduction',
    component: MortgageWelcome,
    title: 'title.mortgageWelcome' satisfies MessageKey,
  },
  {
    path: 'profil',
    component: MortgageProfile,
    title: 'title.mortgageProfile' satisfies MessageKey,
  },
  {
    path: 'comparaison',
    component: MortgagePage,
    canActivate: [mortgageComparisonGuard],
    title: 'title.mortgage' satisfies MessageKey,
  },
  {
    path: 'methode',
    component: MortgageMethod,
    title: 'title.mortgageMethod' satisfies MessageKey,
  },
];
