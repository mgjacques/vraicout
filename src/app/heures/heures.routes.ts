import { Routes } from '@angular/router';
import { MessageKey } from '../shared/i18n/fr';
import { HoursMethod } from './method/hours-method';
import { HoursPage } from './page/hours-page';

/** Mounted under /heures. One page: the form and the hours side by side. */
export const HEURES_ROUTES: Routes = [
  { path: '', component: HoursPage, title: 'title.hours' satisfies MessageKey },
  { path: 'methode', component: HoursMethod, title: 'title.hoursMethod' satisfies MessageKey },
];
