import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { routes } from '../../app.routes';
import { APP_NAME } from '../app-name';
import { fr, MessageKey } from '../i18n/fr';
import { PageMeta } from './page-meta';
import { documentTitle, findPage, pageHead, plainText, SITE_PAGES } from './pages';
import { NOINDEX, SITE_URL } from './site';

const t = (key: MessageKey) => fr[key];

/** Every address of the router, with its title key, lazy tools included. */
async function routeTitles(list: Routes, prefix = ''): Promise<Map<string, string | undefined>> {
  const found = new Map<string, string | undefined>();
  for (const route of list) {
    if (route.path === '**') continue;
    const path = [prefix, route.path].filter(Boolean).join('/');
    const children = route.loadChildren ? ((await route.loadChildren()) as Routes) : route.children;
    if (children) {
      for (const [child, title] of await routeTitles(children, path)) found.set(child, title);
    } else {
      found.set('/' + path, route.title as string | undefined);
    }
  }
  return found;
}

describe('SITE_PAGES', () => {
  it('lists every address of the router, with the same title', async () => {
    const fromRoutes = await routeTitles(routes);
    const fromPages = new Map(SITE_PAGES.map((page) => [page.path, page.title]));
    expect(fromPages).toEqual(fromRoutes);
  });

  it('lists each address once', () => {
    const paths = SITE_PAGES.map((page) => page.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gives every listed page a plain description of a reasonable length', () => {
    for (const page of SITE_PAGES.filter((p) => p.description)) {
      const text = plainText(t(page.description!));
      expect(text.length, page.path).toBeGreaterThan(40);
      expect(text.length, page.path).toBeLessThan(260);
    }
  });
});

describe('findPage', () => {
  it('ignores the query, the fragment and a trailing slash', () => {
    expect(findPage('/frais/?persona=x#top')?.path).toBe('/frais');
    expect(findPage('/')?.path).toBe('/');
    expect(findPage('/nulle-part')).toBeUndefined();
  });
});

describe('pageHead', () => {
  it('gives a listed page its own description, share title and canonical link', () => {
    const head = pageHead(findPage('/frais'), t);
    expect(head.title).toBe(documentTitle(fr['title.feesWelcome']));
    expect(head.description).toBe(fr['fees.welcome.lede']);
    expect(head.shareTitle).toBe(fr['tool.fees.title']);
    expect(head.canonical).toBe(`${SITE_URL}/frais`);
  });

  it('names the site alone when the home page is shared', () => {
    const head = pageHead(findPage('/'), t);
    expect(head.shareTitle).toBe(APP_NAME);
    expect(head.canonical).toBe(`${SITE_URL}/`);
  });

  it('gives no canonical link to a page kept out of search engines, nor to an unknown address', () => {
    expect(pageHead(findPage('/assurance/comparaison'), t).canonical).toBeUndefined();
    const unknown = pageHead(undefined, t);
    expect(unknown.canonical).toBeUndefined();
    expect(unknown.title).toBe(APP_NAME);
    expect(unknown.description).toBe(plainText(fr['home.lede']));
  });
});

describe('PageMeta', () => {
  let meta: Meta;
  let pageMeta: PageMeta;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    meta = TestBed.inject(Meta);
    pageMeta = TestBed.inject(PageMeta);
    document = TestBed.inject(DOCUMENT);
  });

  const canonical = () => document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  it('sets the description, the share tags and the canonical link of a listed page', () => {
    pageMeta.apply('/impot');
    expect(meta.getTag('name="description"')?.content).toBe(fr['marginal.lede']);
    expect(meta.getTag('property="og:title"')?.content).toBe(fr['tool.marginal.title']);
    expect(meta.getTag('property="og:url"')?.content).toBe(`${SITE_URL}/impot`);
    expect(canonical()?.href).toBe(`${SITE_URL}/impot`);
    expect(meta.getTag('name="robots"')?.content).toBe(NOINDEX ? 'noindex' : undefined);
  });

  it('keeps an unknown address out of search engines, without a canonical link', () => {
    pageMeta.apply('/impot');
    pageMeta.apply('/nulle-part');
    expect(canonical()).toBeNull();
    expect(meta.getTag('property="og:url"')).toBeNull();
    expect(meta.getTag('name="robots"')?.content).toBe('noindex');
  });
});
