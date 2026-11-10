import { Routes } from '@angular/router';
import { MessageKey } from '../shared/i18n/fr';
import { SplitMethod } from './method/split-method';
import { SplitPage } from './page/split-page';

/** Mounted under /partage. One page: the form and the split side by side. */
export const PARTAGE_ROUTES: Routes = [
  { path: '', component: SplitPage, title: 'title.split' satisfies MessageKey },
  { path: 'methode', component: SplitMethod, title: 'title.splitMethod' satisfies MessageKey },
];
