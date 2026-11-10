import { Routes } from '@angular/router';
import { MessageKey } from '../shared/i18n/fr';
import { comparisonGuard, welcomeGuard } from './compare/comparison.guard';
import { Compare } from './compare/compare';
import { InsuranceMethod } from './method/method';
import { Profile } from './profile/profile';
import { Welcome } from './welcome/welcome';

/** Mounted under /assurance. */
export const ASSURANCE_ROUTES: Routes = [
  {
    path: '',
    component: Welcome,
    canActivate: [welcomeGuard],
    title: 'title.welcome' satisfies MessageKey,
  },
  // The same page without the guard: the results link back to it.
  {
    path: 'introduction',
    component: Welcome,
    title: 'title.welcome' satisfies MessageKey,
  },
  { path: 'methode', component: InsuranceMethod, title: 'title.method' satisfies MessageKey },
  { path: 'profil', component: Profile, title: 'title.profile' satisfies MessageKey },
  {
    path: 'comparaison',
    component: Compare,
    canActivate: [comparisonGuard],
    title: 'title.compare' satisfies MessageKey,
  },
];
