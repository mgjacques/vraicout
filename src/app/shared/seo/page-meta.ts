import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { findPage, pageHead } from './pages';
import { NOINDEX } from './site';

/**
 * Keeps the description, the share tags, the canonical link and `robots` in step with the
 * page shown. The HTML files written after the build already carry them for each address;
 * this covers the navigation inside the app, and search engines that run the scripts.
 */
@Injectable({ providedIn: 'root' })
export class PageMeta {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  /** Called once, by the root component. */
  start(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.apply(event.urlAfterRedirects));
  }

  apply(url: string): void {
    const page = findPage(url);
    const head = pageHead(page, (key) => this.i18n.t(key));

    this.meta.updateTag({ name: 'description', content: head.description });
    this.meta.updateTag({ property: 'og:title', content: head.shareTitle });
    this.meta.updateTag({ property: 'og:description', content: head.description });

    if (head.canonical) {
      this.meta.updateTag({ property: 'og:url', content: head.canonical });
      this.canonicalLink().href = head.canonical;
    } else {
      this.meta.removeTag('property="og:url"');
      this.document.head.querySelector('link[rel="canonical"]')?.remove();
    }

    if (NOINDEX || !head.canonical) this.meta.updateTag({ name: 'robots', content: 'noindex' });
    else this.meta.removeTag('name="robots"');
  }

  private canonicalLink(): HTMLLinkElement {
    const found = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (found) return found;
    const link = this.document.createElement('link');
    link.rel = 'canonical';
    this.document.head.appendChild(link);
    return link;
  }
}
