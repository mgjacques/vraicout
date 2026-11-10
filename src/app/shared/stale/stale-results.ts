import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Message } from 'primeng/message';
import { I18nService } from '../i18n/i18n.service';

/**
 * Results that keep the last complete figures while a required field is empty: they turn
 * grey under a note, so they never pass for an answer to what the form now says.
 */
@Component({
  selector: 'app-stale-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Message],
  host: { class: 'stale-results', '[class.stale]': 'stale()' },
  template: `@if (stale()) {
      <p-message severity="warn" class="stale-note">{{ i18n.t('results.stale') }}</p-message>
    }
    <ng-content />`,
})
export class StaleResults {
  readonly stale = input(false);
  readonly i18n = inject(I18nService);
}
