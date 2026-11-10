import { Routes } from '@angular/router';
import { MessageKey } from '../shared/i18n/fr';
import { feesComparisonGuard, feesWelcomeGuard } from './page/fees.guards';
import { FeesPage } from './page/fees-page';
import { FeesProfile } from './profile/fees-profile';
import { FeesMethod } from './method/fees-method';
import { FeesWelcome } from './welcome/fees-welcome';

/** Mounted under /frais. */
export const FRAIS_ROUTES: Routes = [
  {
    path: '',
    component: FeesWelcome,
    canActivate: [feesWelcomeGuard],
    title: 'title.feesWelcome' satisfies MessageKey,
  },
  // The same page without the guard: the results link back to it.
  {
    path: 'introduction',
    component: FeesWelcome,
    title: 'title.feesWelcome' satisfies MessageKey,
  },
  { path: 'methode', component: FeesMethod, title: 'title.feesMethod' satisfies MessageKey },
  { path: 'profil', component: FeesProfile, title: 'title.feesProfile' satisfies MessageKey },
  {
    path: 'comparaison',
    component: FeesPage,
    canActivate: [feesComparisonGuard],
    title: 'title.fees' satisfies MessageKey,
  },
];
