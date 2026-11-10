import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../shared/i18n/i18n.service';

/** Any unknown address: says so, instead of silently landing on the home page. */
@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="wrap narrow">
      <header class="mast">
        <h1>{{ i18n.t('notFound.title') }}</h1>
        <p class="lede">{{ i18n.t('notFound.body') }}</p>
      </header>
      <p class="doc-back">
        <a routerLink="/"
          ><i class="pi pi-arrow-left" aria-hidden="true"></i> {{ i18n.t('notFound.home') }}</a
        >
      </p>
    </div>
  `,
})
export class NotFoundPage {
  readonly i18n = inject(I18nService);
}
