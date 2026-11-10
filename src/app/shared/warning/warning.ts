import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Message } from 'primeng/message';
import { I18nService } from '../i18n/i18n.service';

const BODIES = {
  insurance: 'warning.body',
  investing: 'warning.investing.body',
  resources: 'warning.resources.body',
} as const;

@Component({
  selector: 'app-warning',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Message],
  templateUrl: './warning.html',
})
export class Warning {
  /** Who regulates the advice the page stands in for: insurance or investing, or a reading list. */
  readonly variant = input<'insurance' | 'investing' | 'resources'>('insurance');
  readonly i18n = inject(I18nService);
  readonly body = computed(() => this.i18n.t(BODIES[this.variant()]));
}
