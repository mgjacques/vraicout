import { Routes } from '@angular/router';
import { MessageKey } from '../shared/i18n/fr';
import { SavingsMethod } from './method/savings-method';
import { SavingsPage } from './page/savings-page';

/** Mounted under /epargne. One page: the form, the balance and its chart. */
export const EPARGNE_ROUTES: Routes = [
  { path: '', component: SavingsPage, title: 'title.savings' satisfies MessageKey },
  { path: 'methode', component: SavingsMethod, title: 'title.savingsMethod' satisfies MessageKey },
];
