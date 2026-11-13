import { signal } from '@angular/core';
import type { MessageKey } from './fr';
import { common } from './fr/common';
import { home } from './fr/home';
import { privacy } from './fr/privacy';
import { resources } from './fr/resources';
import { transfer } from './fr/transfer';

export type Catalog = Partial<Record<MessageKey, string>>;

/**
 * Texts every page may show: the shell, the home page and the small pages it links to.
 * They ship in the main bundle; each tool's texts load with its route.
 */
export const BASE_MESSAGES: Catalog = { ...common, ...home, ...privacy, ...resources, ...transfer };

/** One loader per tool catalog, each a chunk of its own. */
export const TOOL_CATALOGS = {
  assurance: () => import('./fr/assurance').then((m) => m.assurance),
  fees: () => import('./fr/fees').then((m) => m.fees),
  mortgage: () => import('./fr/mortgage').then((m) => m.mortgage),
  split: () => import('./fr/split').then((m) => m.split),
  hours: () => import('./fr/hours').then((m) => m.hours),
  spending: () => import('./fr/spending').then((m) => m.spending),
  savings: () => import('./fr/savings').then((m) => m.savings),
  marginal: () => import('./fr/marginal').then((m) => m.marginal),
} satisfies Record<string, () => Promise<Catalog>>;

export type ToolCatalog = keyof typeof TOOL_CATALOGS;

export const ALL_TOOL_CATALOGS = Object.keys(TOOL_CATALOGS) as ToolCatalog[];

/** The texts loaded so far. Read by I18nService. */
export const loadedMessages = signal<Catalog>(BASE_MESSAGES);

const loading = new Map<ToolCatalog, Promise<void>>();

export function loadCatalog(name: ToolCatalog): Promise<void> {
  let pending = loading.get(name);
  if (!pending) {
    pending = TOOL_CATALOGS[name]().then((texts) =>
      loadedMessages.update((current) => ({ ...current, ...texts })),
    );
    loading.set(name, pending);
  }
  return pending;
}

/**
 * Wraps a route's `loadChildren` or `loadComponent`: the route waits for its catalogs,
 * so its titles, descriptions and texts are there before anything reads them.
 */
export function withCatalogs<T>(
  names: readonly ToolCatalog[],
  load: () => Promise<T>,
): () => Promise<T> {
  return () => Promise.all([load(), ...names.map(loadCatalog)]).then(([loaded]) => loaded);
}
