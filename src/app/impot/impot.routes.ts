import { Routes } from '@angular/router';
import { MessageKey } from '../shared/i18n/fr';
import { MarginalMethod } from './method/marginal-method';
import { MarginalPage } from './page/marginal-page';

/** Mounted under /impot. One page: the income and the rates side by side, the chart under them. */
export const IMPOT_ROUTES: Routes = [
  { path: '', component: MarginalPage, title: 'title.marginal' satisfies MessageKey },
  {
    path: 'methode',
    component: MarginalMethod,
    title: 'title.marginalMethod' satisfies MessageKey,
  },
];
