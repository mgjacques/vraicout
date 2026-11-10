import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

/** After a required field's label: a red asterisk on screen, « obligatoire » for screen readers. */
@Component({
  selector: 'app-required-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="required-mark" aria-hidden="true">*</span
    ><span class="visually-hidden">{{ i18n.t('field.required') }}</span>`,
})
export class RequiredMark {
  readonly i18n = inject(I18nService);
}
