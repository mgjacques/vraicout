import { Routes } from '@angular/router';
import { MessageKey } from '../shared/i18n/fr';
import { SpendingMethod } from './method/spending-method';
import { SpendingPage } from './page/spending-page';

/** Mounted under /depenses. One page: the spending and its cost side by side. */
export const DEPENSES_ROUTES: Routes = [
  { path: '', component: SpendingPage, title: 'title.spending' satisfies MessageKey },
  {
    path: 'methode',
    component: SpendingMethod,
    title: 'title.spendingMethod' satisfies MessageKey,
  },
];
