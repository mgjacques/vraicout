import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { RESOURCE_SECTIONS } from './ressources/resources.data';
import { modelUrl, SOURCE_URL } from './shared/contact';
import { SiteFooter } from './shell/site-footer/site-footer';
import { fr } from './shared/i18n/fr';
import { ScenarioStore } from './assurance/state/scenario.store';
import { FeesStore } from './frais/state/fees.store';
import { MortgageStore } from './hypotheque/state/mortgage.store';

describe('App', () => {
  beforeAll(() => {
    if (typeof window.matchMedia !== 'function') {
      window.matchMedia = (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => undefined,
          removeListener: () => undefined,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => false,
        }) as MediaQueryList;
    }
    HTMLCanvasElement.prototype.getContext = function getContext() {
      return {
        canvas: document.createElement('canvas'),
        fillRect: () => undefined,
        clearRect: () => undefined,
        getImageData: () => ({ data: new Uint8ClampedArray() }),
        putImageData: () => undefined,
        createImageData: () => [],
        setTransform: () => undefined,
        drawImage: () => undefined,
        save: () => undefined,
        restore: () => undefined,
        beginPath: () => undefined,
        moveTo: () => undefined,
        lineTo: () => undefined,
        closePath: () => undefined,
        stroke: () => undefined,
        translate: () => undefined,
        scale: () => undefined,
        rotate: () => undefined,
        arc: () => undefined,
        fill: () => undefined,
        measureText: () => ({ width: 0 }),
        transform: () => undefined,
        rect: () => undefined,
        clip: () => undefined,
      } as unknown as CanvasRenderingContext2D;
    } as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      providers: [...appConfig.providers],
    }).compileComponents();
  });

  it('lists every tool on /', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['home.title']);
    const links = [...page.querySelectorAll('.tool-card')].map((a) => a.getAttribute('href'));
    expect(links).toEqual([
      '/partage',
      '/heures',
      '/depenses',
      '/impot',
      '/epargne',
      '/frais',
      '/assurance',
      '/hypotheque',
    ]);
    expect(page.querySelector('#a-propos h2')?.textContent).toContain(fr['about.title']);
  });

  it('links every page to the tools, /confidentialite and the code, from the footer', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    const footer = TestBed.createComponent(SiteFooter);
    footer.detectChanges();
    const links = footer.nativeElement as HTMLElement;
    expect(links.querySelector('a[href="/confidentialite"]')?.textContent).toContain(
      fr['footer.privacy'],
    );
    expect(links.querySelector(`a[href="${SOURCE_URL}"]`)).not.toBeNull();
    expect(
      [...links.querySelectorAll('nav a[href^="/"]')].map((a) => a.getAttribute('href')),
    ).toEqual([
      '/partage',
      '/heures',
      '/depenses',
      '/impot',
      '/epargne',
      '/frais',
      '/assurance',
      '/hypotheque',
      '/#a-propos',
      '/ressources',
      '/sources',
      '/confidentialite',
      '/donnees',
    ]);
    await harness.navigateByUrl('/confidentialite');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['privacy.title']);
    expect(page.querySelector('#responsable-title')?.textContent).toContain(
      fr['privacy.officer.title'],
    );
    expect(page.querySelector('#responsable a[href^="mailto:"]')).not.toBeNull();
  });

  it('shows the insurance welcome on /assurance', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/assurance');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['welcome.title']);
    expect(page.querySelector('#audience-title')?.textContent).toContain(
      fr['welcome.audience.title'],
    );
    expect(page.querySelectorAll('.audience li').length).toBe(6);
    expect(page.querySelector('#purpose-title')?.textContent).toContain(
      fr['welcome.purpose.title'],
    );
    expect(page.querySelector('.checklist')?.textContent).toContain(fr['welcome.check.parents']);
  });

  it('refuses the comparison until a profile is committed', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/assurance/comparaison');
    expect(TestBed.inject(Router).url).toBe('/assurance/profil');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      fr['profile.title'],
    );
  });

  it('keeps the profile on its first step until the age is entered', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/assurance/profil');
    const page = () => harness.routeNativeElement as HTMLElement;
    const kicker = () => page().querySelector('.kicker')?.textContent ?? '';
    const next = () =>
      [...page().querySelectorAll<HTMLButtonElement>('.profile-actions button')].find((button) =>
        button.textContent?.includes(fr['profile.next']),
      );
    expect(kicker()).toContain('1 sur 4');

    next()?.click();
    await harness.fixture.whenStable();
    expect(kicker()).toContain('1 sur 4');
    expect(page().querySelector('.profile-actions .error')?.textContent).toContain(
      fr['drawer.age'],
    );

    const store = TestBed.inject(ScenarioStore);
    store.draft.update((draft) => ({ ...draft, profile: { ...draft.profile, currentAge: 30 } }));
    await harness.fixture.whenStable();
    next()?.click();
    await harness.fixture.whenStable();
    expect(kicker()).toContain('2 sur 4');
  });

  it('opens the fees tool on its introduction, then on the results once the steps are done', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/frais');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      fr['fees.welcome.title'],
    );

    await harness.navigateByUrl('/frais/comparaison');
    expect(TestBed.inject(Router).url).toBe('/frais');

    TestBed.inject(FeesStore).finish();
    await harness.navigateByUrl('/');
    await harness.navigateByUrl('/frais');
    expect(TestBed.inject(Router).url).toBe('/frais/comparaison');
  });

  it('lists every tool method on /sources, linked from the footer, each with its date', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    const footer = TestBed.createComponent(SiteFooter);
    footer.detectChanges();
    expect(
      (footer.nativeElement as HTMLElement).querySelector('a[href="/sources"]')?.textContent,
    ).toContain(fr['method.title']);

    await harness.navigateByUrl('/sources');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['method.title']);
    expect(
      [...page.querySelectorAll('.doc-section:not(#organismes) a')].map((a) =>
        a.getAttribute('href'),
      ),
    ).toEqual([
      '/partage/methode',
      '/heures/methode',
      '/depenses/methode',
      '/impot/methode',
      '/epargne/methode',
      '/frais/methode',
      '/assurance/methode',
      '/hypotheque/methode',
    ]);
    expect(page.textContent).toContain(fr['mortgage.method.updated']);
    expect(
      page.querySelector('#organismes a[href="https://lautorite.qc.ca"]')?.textContent,
    ).toContain(fr['method.index.authorities.amf']);
    expect(page.querySelectorAll('#organismes a[target="_blank"]').length).toBe(6);
  });

  it('lists the resources on /ressources, by section, with outside links', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/ressources');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['resources.title']);
    expect(document.title).toContain(fr['resources.title']);
    expect(page.querySelector('app-warning')?.textContent).toContain(fr['warning.resources.body']);

    const links = [...page.querySelectorAll('.resource-list a')];
    expect(links.length).toBe(RESOURCE_SECTIONS.flatMap((section) => section.entries).length);
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }

    expect(page.querySelector('#sites')?.textContent).toContain(fr['resources.inEnglish']);
    // No split by reading level, and the English books are gone.
    expect(page.querySelectorAll('.doc-section h3').length).toBe(0);
    expect(page.querySelector('#livres-anglais')).toBeNull();
    expect(page.querySelector('#details-et-sources a[href="/sources"]')?.textContent).toContain(
      fr['resources.sources.link'],
    );
  });

  it('shows the fees method without any figures entered, each benchmark with its source', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/frais');
    const welcome = harness.routeNativeElement as HTMLElement;
    expect(welcome.querySelector('a[href="/frais/methode"]')?.textContent).toContain(
      fr['method.link'],
    );

    await harness.navigateByUrl('/frais/methode');
    expect(TestBed.inject(Router).url).toBe('/frais/methode');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['method.title']);
    expect(page.querySelector('.mast')?.textContent).toContain(fr['fees.method.updated']);
    expect(page.querySelector('#reperes-title')?.textContent).toContain(fr['method.ref.title']);
    expect(page.querySelectorAll('#reperes .doc-source a[href^="https://"]').length).toBe(4);
    expect(page.querySelector(`a[href^="${SOURCE_URL}/blob/"]`)).not.toBeNull();
    expect(page.querySelectorAll('#calcul .doc-math').length).toBe(2);
    expect(page.querySelectorAll('#calcul .doc-math math').length).toBe(7);
    expect(page.querySelectorAll('#calcul .doc-symbols msub').length).toBe(2);
  });

  it('shows the insurance method without any figures entered, each benchmark with its source', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/assurance');
    const welcome = harness.routeNativeElement as HTMLElement;
    expect(welcome.querySelector('a[href="/assurance/methode"]')?.textContent).toContain(
      fr['method.link'],
    );

    await harness.navigateByUrl('/assurance/methode');
    expect(TestBed.inject(Router).url).toBe('/assurance/methode');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['method.title']);
    expect(page.querySelector('.mast')?.textContent).toContain(fr['insurance.method.updated']);
    expect(page.querySelector('#reperes-title')?.textContent).toContain(fr['method.ref.title']);
    expect(page.querySelectorAll('#reperes .doc-source a[href^="https://"]').length).toBe(4);
    expect(page.querySelectorAll('#calcul .doc-math').length).toBe(3);
    const formulas = page.querySelectorAll('#calcul .doc-math math');
    expect(formulas.length).toBe(5);
    expect(formulas[0].namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
    expect(page.querySelectorAll('#calcul .doc-symbols dt').length).toBe(17);
    expect(page.querySelector('#calcul .doc-symbols')?.textContent).toContain(
      fr['insurance.method.symbol.gap'],
    );
    expect(page.querySelector(`a[href=\"${modelUrl('modele-de-calcul.md')}\"]`)).not.toBeNull();
  });

  it('shows the mortgage method without any figures entered, each rule with its source', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/hypotheque');
    const welcome = harness.routeNativeElement as HTMLElement;
    expect(welcome.querySelector('a[href="/hypotheque/methode"]')?.textContent).toContain(
      fr['method.link'],
    );

    await harness.navigateByUrl('/hypotheque/methode');
    expect(TestBed.inject(Router).url).toBe('/hypotheque/methode');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['method.title']);
    expect(page.querySelector('.mast')?.textContent).toContain(fr['mortgage.method.updated']);
    expect(page.querySelector('#reperes-title')?.textContent).toContain(fr['method.ref.title']);
    expect(page.querySelectorAll('#reperes .doc-source a[href^="https://"]').length).toBe(4);
    expect(
      page.querySelector(`a[href=\"${modelUrl('modele-de-calcul-hypotheque.md')}\"]`),
    ).not.toBeNull();
    // The formulas sit right under the Interest Act source, which stays under its paragraph.
    expect(page.querySelector('#calcul .doc-source + p + .doc-math')).not.toBeNull();
    expect(page.querySelectorAll('#calcul .doc-math math').length).toBe(3);
    expect(page.querySelectorAll('#calcul .doc-symbols dt').length).toBe(6);
  });

  it('shows the split method without any figures entered, the tax brackets with their source', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/partage');
    const tool = harness.routeNativeElement as HTMLElement;
    expect(tool.querySelector('a.method-link[href="/partage/methode"]')?.textContent).toContain(
      fr['method.link'],
    );

    await harness.navigateByUrl('/partage/methode');
    expect(TestBed.inject(Router).url).toBe('/partage/methode');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['method.title']);
    expect(page.querySelector('.mast')?.textContent).toContain(fr['split.method.updated']);
    expect(page.querySelector('#reperes-title')?.textContent).toContain(fr['method.ref.title']);
    expect(page.querySelectorAll('#reperes .doc-source a[href^="https://"]').length).toBe(1);
    expect(
      page.querySelector(`a[href=\"${modelUrl('modele-de-calcul-partage.md')}\"]`),
    ).not.toBeNull();
  });

  it('shows the hours method without any figures entered, its tax rates with their source', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/heures');
    const tool = harness.routeNativeElement as HTMLElement;
    expect(tool.querySelector('a.method-link[href="/heures/methode"]')?.textContent).toContain(
      fr['method.link'],
    );

    await harness.navigateByUrl('/heures/methode');
    expect(TestBed.inject(Router).url).toBe('/heures/methode');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['method.title']);
    expect(page.querySelector('.mast')?.textContent).toContain(fr['hours.method.updated']);
    expect(page.querySelector('#reperes-title')?.textContent).toContain(fr['method.ref.title']);
    expect(page.querySelectorAll('#reperes .doc-source a[href^="https://"]').length).toBe(1);
    expect(
      page.querySelector(`a[href=\"${modelUrl('modele-de-calcul-heures.md')}\"]`),
    ).not.toBeNull();
  });

  it('opens the mortgage tool on its introduction, then on the results once the steps are done', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/hypotheque');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      fr['mortgage.welcome.title'],
    );

    await harness.navigateByUrl('/hypotheque/comparaison');
    expect(TestBed.inject(Router).url).toBe('/hypotheque');

    await harness.navigateByUrl('/hypotheque/profil');
    expect(harness.routeNativeElement?.querySelector('.kicker')?.textContent).toContain('1 sur 3');

    TestBed.inject(MortgageStore).finish();
    await harness.navigateByUrl('/');
    await harness.navigateByUrl('/hypotheque');
    expect(TestBed.inject(Router).url).toBe('/hypotheque/comparaison');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelectorAll('.mortgage-card').length).toBe(2);
    expect(page.querySelector('.mortgage-diff')?.textContent).toContain(
      fr['mortgage.diff.beneficiary.bank'],
    );
  });

  it('opens the split tool on one page', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/partage');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['split.title']);
    expect(page.querySelector('.split-ratio')?.textContent).toContain('58');
    expect(page.querySelector('#split-basis-title')?.textContent).toContain(
      fr['split.basis.heading'],
    );
  });

  it('opens the hours tool with the hours of the starting figures', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/heures');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['hours.title']);
    expect(page.querySelector('.hours-big')?.textContent).toContain('60,4\u00a0h');
  });

  it('opens the frequent spending tool with the cost of the starting figures', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/depenses');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['spending.title']);
    const big = [...page.querySelectorAll('.spending-big')].map((p) => p.textContent);
    expect(big[0]).toContain('1\u00a0300\u00a0$');
    expect(big[1]).toContain('18\u00a0531\u00a0$');
  });

  it('opens the marginal rate tool with the rate of the starting figures, and its method', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/impot');
    const tool = harness.routeNativeElement as HTMLElement;
    expect(tool.querySelector('h1')?.textContent).toContain(fr['marginal.title']);
    expect(tool.querySelector('.marginal-big')?.textContent).toContain('36,12\u00a0%');
    expect(tool.querySelector('a.method-link[href="/impot/methode"]')).not.toBeNull();

    await harness.navigateByUrl('/impot/methode');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('.mast')?.textContent).toContain(fr['marginal.method.updated']);
    expect(page.querySelectorAll('#reperes .doc-source a[href^="https://"]').length).toBe(3);
    expect(page.querySelectorAll('#calcul .doc-math math').length).toBe(3);
    expect(page.querySelectorAll('#calcul .doc-symbols dt').length).toBe(13);
    expect(
      page.querySelector(`a[href=\"${modelUrl('modele-de-calcul-impot.md')}\"]`),
    ).not.toBeNull();
  });

  it('opens the savings tool with the balance of the starting figures, and its method', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/epargne');
    const tool = harness.routeNativeElement as HTMLElement;
    expect(tool.querySelector('h1')?.textContent).toContain(fr['savings.title']);
    expect(tool.querySelector('.savings-big')?.textContent).toContain('194\u00a0610\u00a0$');
    expect(tool.querySelector('a.method-link[href="/epargne/methode"]')).not.toBeNull();

    await harness.navigateByUrl('/epargne/methode');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('.mast')?.textContent).toContain(fr['savings.method.updated']);
    expect(page.querySelectorAll('#reperes .doc-source a[href^="https://"]').length).toBe(2);
    const formulas = page.querySelectorAll('#calcul .doc-math math');
    expect(formulas.length).toBe(3);
    expect(formulas[0].namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
    expect(page.querySelectorAll('#calcul .doc-symbols dt').length).toBe(8);
    expect(page.querySelector('#calcul .doc-symbols')?.textContent).toContain(
      fr['savings.method.symbol.m'],
    );
    expect(
      page.querySelector(`a[href=\"${modelUrl('modele-de-calcul-epargne.md')}\"]`),
    ).not.toBeNull();
  });

  it('keeps each introduction reachable from the results, with a button back to them', async () => {
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    TestBed.inject(FeesStore).finish();
    TestBed.inject(MortgageStore).finish();

    for (const tool of [
      { path: '/frais', title: fr['fees.welcome.title'] },
      { path: '/hypotheque', title: fr['mortgage.welcome.title'] },
    ]) {
      await harness.navigateByUrl(tool.path + '/comparaison');
      const links = (harness.routeNativeElement as HTMLElement).querySelector('.tool-links');
      expect(links?.querySelector(`a[href="${tool.path}/introduction"]`)?.textContent).toContain(
        fr['toolLinks.intro'],
      );
      expect(links?.querySelector(`a[href="${tool.path}/methode"]`)?.textContent).toContain(
        fr['method.title'],
      );

      await harness.navigateByUrl(tool.path + '/introduction');
      expect(router.url).toBe(tool.path + '/introduction');
      const page = harness.routeNativeElement as HTMLElement;
      expect(page.querySelector('h1')?.textContent).toContain(tool.title);
      const back = page.querySelector<HTMLButtonElement>('.welcome-actions button');
      expect(back?.textContent).toContain(fr['welcome.backToResults']);
      back?.click();
      await harness.fixture.whenStable();
      expect(router.url).toBe(tool.path + '/comparaison');
    }
  });

  it('starts the profile from the insurance introduction while there are no results yet', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/assurance/introduction');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['welcome.title']);
    expect(page.querySelector('.welcome-actions button')?.textContent).toContain(
      fr['welcome.start'],
    );
  });

  it('links the one-page tools to their method under the title', async () => {
    const harness = await RouterTestingHarness.create();
    for (const path of ['/partage', '/heures', '/depenses', '/impot', '/epargne']) {
      await harness.navigateByUrl(path);
      const links = (harness.routeNativeElement as HTMLElement).querySelector('.mast .tool-links');
      expect(links?.querySelectorAll('a').length).toBe(1);
      expect(links?.querySelector(`a[href="${path}/methode"]`)?.textContent).toContain(
        fr['method.title'],
      );
    }
  });

  it('places each tool page in a breadcrumb, the current page last and not a link', async () => {
    const harness = await RouterTestingHarness.create();
    const trail = () => {
      const nav = (harness.routeNativeElement as HTMLElement).querySelector('.tool-breadcrumb');
      return {
        label: nav?.getAttribute('aria-label'),
        steps: [...(nav?.querySelectorAll('li:not(.p-breadcrumb-separator)') ?? [])].map((li) =>
          li.textContent?.trim(),
        ),
        links: [...(nav?.querySelectorAll('a') ?? [])].map((a) => a.getAttribute('href')),
        current: nav?.querySelector('[aria-current="page"]')?.textContent?.trim(),
      };
    };

    await harness.navigateByUrl('/hypotheque/methode');
    expect(trail()).toEqual({
      label: fr['breadcrumb.label'],
      steps: [
        fr['shell.navHome'],
        fr['tool.group.savings'],
        fr['tool.mortgage.short'],
        fr['method.title'],
      ],
      links: ['/', '/hypotheque'],
      current: fr['method.title'],
    });

    await harness.navigateByUrl('/frais');
    expect(trail().current).toBe(fr['breadcrumb.intro']);

    await harness.navigateByUrl('/partage');
    expect(trail().steps).toEqual([
      fr['shell.navHome'],
      fr['tool.group.everyday'],
      fr['tool.split.short'],
    ]);
    expect(trail().links).toEqual(['/']);
    expect(trail().current).toBe(fr['tool.split.short']);
  });

  it('says an unknown address does not exist, with a way back home', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/nulle-part');
    expect(TestBed.inject(Router).url).toBe('/nulle-part');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain(fr['notFound.title']);
    expect(page.querySelector('a[href="/"]')?.textContent).toContain(fr['notFound.home']);
  });

  it('lists the sections of each long results page, each link landing in its section', async () => {
    // jsdom does not scroll.
    Element.prototype.scrollIntoView ??= () => undefined;
    const harness = await RouterTestingHarness.create();
    TestBed.inject(ScenarioStore).useExample();
    TestBed.inject(FeesStore).finish();
    TestBed.inject(MortgageStore).finish();

    for (const tool of [
      { path: '/assurance/comparaison', count: 5 },
      { path: '/frais/comparaison', count: 4 },
      { path: '/hypotheque/comparaison', count: 5 },
    ]) {
      await harness.navigateByUrl(tool.path);
      const page = harness.routeNativeElement as HTMLElement;
      const nav = page.querySelector('.page-contents');
      expect(nav?.querySelector('h2')?.textContent).toContain(fr['contents.label']);
      const links = [...(nav?.querySelectorAll('a') ?? [])];
      expect(links.length).toBe(tool.count);
      for (const link of links) {
        const href = link.getAttribute('href') ?? '';
        expect(href.startsWith(tool.path + '#')).toBe(true);
        expect(page.querySelector('#' + href.split('#')[1])).not.toBeNull();
      }

      const last = links[links.length - 1];
      last.click();
      expect(document.activeElement?.id).toBe(last.getAttribute('href')?.split('#')[1]);
    }
  });
});
