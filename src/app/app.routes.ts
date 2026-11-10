import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, Routes, TitleStrategy } from '@angular/router';
import { Home } from './home/home';
import { MessageKey } from './shared/i18n/fr';
import { I18nService } from './shared/i18n/i18n.service';
import { documentTitle } from './shared/seo/pages';

/**
 * One prefix per tool, each loaded on demand. Route titles are catalog keys,
 * so the tab title follows the language.
 */
export const routes: Routes = [
  { path: '', component: Home, title: 'title.home' satisfies MessageKey },
  {
    path: 'assurance',
    loadChildren: () => import('./assurance/assurance.routes').then((m) => m.ASSURANCE_ROUTES),
  },
  {
    path: 'frais',
    loadChildren: () => import('./frais/frais.routes').then((m) => m.FRAIS_ROUTES),
  },
  {
    path: 'hypotheque',
    loadChildren: () => import('./hypotheque/hypotheque.routes').then((m) => m.HYPOTHEQUE_ROUTES),
  },
  {
    path: 'partage',
    loadChildren: () => import('./partage/partage.routes').then((m) => m.PARTAGE_ROUTES),
  },
  {
    path: 'heures',
    loadChildren: () => import('./heures/heures.routes').then((m) => m.HEURES_ROUTES),
  },
  {
    path: 'depenses',
    loadChildren: () => import('./depenses/depenses.routes').then((m) => m.DEPENSES_ROUTES),
  },
  {
    path: 'epargne',
    loadChildren: () => import('./epargne/epargne.routes').then((m) => m.EPARGNE_ROUTES),
  },
  {
    path: 'impot',
    loadChildren: () => import('./impot/impot.routes').then((m) => m.IMPOT_ROUTES),
  },
  {
    path: 'sources',
    loadComponent: () => import('./sources/sources-page').then((m) => m.SourcesPage),
    title: 'method.title' satisfies MessageKey,
  },
  {
    path: 'ressources',
    loadComponent: () => import('./ressources/ressources-page').then((m) => m.RessourcesPage),
    title: 'resources.title' satisfies MessageKey,
  },
  {
    path: 'confidentialite',
    loadComponent: () => import('./confidentialite/privacy-page').then((m) => m.PrivacyPage),
    title: 'title.privacy' satisfies MessageKey,
  },
  {
    path: 'donnees',
    loadComponent: () => import('./donnees/transfer-page').then((m) => m.TransferPage),
    title: 'title.transfer' satisfies MessageKey,
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found-page').then((m) => m.NotFoundPage),
    title: 'title.notFound' satisfies MessageKey,
  },
];

@Injectable()
export class CatalogTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18nService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot) as MessageKey | undefined;
    this.title.setTitle(documentTitle(key ? this.i18n.t(key) : undefined));
  }
}
