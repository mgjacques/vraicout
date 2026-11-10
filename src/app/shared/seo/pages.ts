import { APP_NAME } from '../app-name';
import { MessageKey } from '../i18n/fr';
import { SITE_URL } from './site';

/**
 * Every address the router knows, one per route. No Angular here: the app reads it to set
 * the page's description and links on each navigation, and `scripts/site-files.mjs` reads it
 * after the build to write one HTML file per address, the sitemap and the headers.
 * A test checks that it matches the routes.
 */
export interface SitePage {
  /** The address, from the root, without a trailing slash: `/`, `/frais/methode`. */
  path: string;
  /** The route's title, the same key as in the routes. */
  title: MessageKey;
  /** Set only for a page that search engines may list: it goes in the sitemap and gets a canonical link. */
  description?: MessageKey;
  /** The title of a shared link, when the tab title says too little (« Avant de commencer »). */
  shareTitle?: MessageKey;
}

export const SITE_PAGES: readonly SitePage[] = [
  { path: '/', title: 'title.home', description: 'home.lede' },

  {
    path: '/partage',
    title: 'title.split',
    description: 'split.lede',
    shareTitle: 'tool.split.title',
  },
  { path: '/partage/methode', title: 'title.splitMethod', description: 'method.lede' },
  {
    path: '/heures',
    title: 'title.hours',
    description: 'hours.lede',
    shareTitle: 'tool.hours.title',
  },
  { path: '/heures/methode', title: 'title.hoursMethod', description: 'method.lede' },
  {
    path: '/depenses',
    title: 'title.spending',
    description: 'spending.lede',
    shareTitle: 'tool.spending.title',
  },
  { path: '/depenses/methode', title: 'title.spendingMethod', description: 'method.lede' },
  {
    path: '/impot',
    title: 'title.marginal',
    description: 'marginal.lede',
    shareTitle: 'tool.marginal.title',
  },
  { path: '/impot/methode', title: 'title.marginalMethod', description: 'method.lede' },
  {
    path: '/epargne',
    title: 'title.savings',
    description: 'savings.lede',
    shareTitle: 'tool.savings.title',
  },
  { path: '/epargne/methode', title: 'title.savingsMethod', description: 'method.lede' },
  {
    path: '/frais',
    title: 'title.feesWelcome',
    description: 'fees.welcome.lede',
    shareTitle: 'tool.fees.title',
  },
  { path: '/frais/methode', title: 'title.feesMethod', description: 'method.lede' },
  { path: '/frais/introduction', title: 'title.feesWelcome' },
  { path: '/frais/profil', title: 'title.feesProfile' },
  { path: '/frais/comparaison', title: 'title.fees' },
  {
    path: '/assurance',
    title: 'title.welcome',
    description: 'welcome.lede',
    shareTitle: 'tool.insurance.title',
  },
  { path: '/assurance/methode', title: 'title.method', description: 'method.lede' },
  { path: '/assurance/introduction', title: 'title.welcome' },
  { path: '/assurance/profil', title: 'title.profile' },
  { path: '/assurance/comparaison', title: 'title.compare' },
  {
    path: '/hypotheque',
    title: 'title.mortgageWelcome',
    description: 'mortgage.welcome.lede',
    shareTitle: 'tool.mortgage.title',
  },
  { path: '/hypotheque/methode', title: 'title.mortgageMethod', description: 'method.lede' },
  { path: '/hypotheque/introduction', title: 'title.mortgageWelcome' },
  { path: '/hypotheque/profil', title: 'title.mortgageProfile' },
  { path: '/hypotheque/comparaison', title: 'title.mortgage' },

  { path: '/sources', title: 'method.title', description: 'method.index.lede' },
  { path: '/ressources', title: 'resources.title', description: 'resources.lede' },
  { path: '/confidentialite', title: 'title.privacy', description: 'privacy.description' },
  { path: '/donnees', title: 'title.transfer', description: 'transfer.lede' },
];

/** What goes in a page's `<head>`, in plain text. */
export interface PageHead {
  title: string;
  description: string;
  shareTitle: string;
  /** Only for a page that search engines may list. */
  canonical?: string;
}

/** The tab title: the route's title, then the name of the site. */
export function documentTitle(text?: string): string {
  return text ? `${text} · ${APP_NAME}` : APP_NAME;
}

/** A catalog text without its `**…**` and `*…*` marks, for a meta tag. */
export function plainText(text: string): string {
  return text.replace(/\*+/g, '');
}

/** The page found at an address, query, fragment and trailing slash aside. */
export function findPage(url: string): SitePage | undefined {
  const path = url.split(/[?#]/)[0].replace(/(.)\/+$/, '$1') || '/';
  return SITE_PAGES.find((page) => page.path === path);
}

/**
 * The head of a page. An address that is not listed (the page « introuvable »), or that is
 * listed without a description, gets the home page's description and no canonical link.
 */
export function pageHead(page: SitePage | undefined, t: (key: MessageKey) => string): PageHead {
  const title = documentTitle(page ? t(page.title) : undefined);
  const shareTitle = page?.shareTitle ? t(page.shareTitle) : page?.path === '/' ? APP_NAME : title;
  return {
    title,
    description: plainText(t(page?.description ?? 'home.lede')),
    shareTitle,
    canonical: page?.description ? SITE_URL + (page.path === '/' ? '/' : page.path) : undefined,
  };
}
