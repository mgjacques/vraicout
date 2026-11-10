import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../shared/i18n/i18n.service';
import { SUPPORT_URL } from '../shared/support';

/**
 * « Soutenir le projet », in the header from tablet width up, and in the menu panel below 1100 px.
 * A plain link: the official button's image would be fetched from Buy Me a Coffee on every page.
 */
@Component({
  selector: 'app-support-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<a class="support-link" [href]="url" target="_blank" rel="noopener noreferrer">{{
    i18n.t('support.label')
  }}</a>`,
})
export class SupportLink {
  readonly i18n = inject(I18nService);
  readonly url = SUPPORT_URL;
}
