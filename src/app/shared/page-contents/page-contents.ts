import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { MessageKey } from '../i18n/fr';
import { I18nService } from '../i18n/i18n.service';

export interface ContentsItem {
  /** The id of the section's element on the page. */
  id: string;
  label: MessageKey;
}

/**
 * Under a long results page's header: a link to each of its sections. A click scrolls there and
 * moves the focus, so that keyboard and screen reader users land in the section too.
 */
@Component({
  selector: 'app-page-contents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="page-contents print-omit" aria-labelledby="page-contents-title">
      <h2 id="page-contents-title" class="page-contents-title">{{ i18n.t('contents.label') }}</h2>
      <ul>
        @for (item of items(); track item.id) {
          <li>
            <a [href]="href(item.id)" (click)="go($event, item.id)">{{ i18n.t(item.label) }}</a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class PageContents {
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly items = input.required<readonly ContentsItem[]>();

  /** The page's own address with the anchor, so that opening the link in a new tab works too. */
  href(id: string): string {
    return this.router.url.split('#')[0] + '#' + id;
  }

  go(event: MouseEvent, id: string): void {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.setAttribute('data-contents-target', '');
    target.focus({ preventScroll: true });
  }
}
