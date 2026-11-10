import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';
import { PrintService } from './print.service';

@Component({
  selector: 'app-print-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="print-button"
      (click)="printer.open()"
      [attr.title]="i18n.t('print.label')"
    >
      <i class="pi pi-print" aria-hidden="true"></i>
      <span class="visually-hidden">{{ i18n.t('print.label') }}</span>
    </button>
  `,
})
export class PrintButton {
  readonly i18n = inject(I18nService);
  readonly printer = inject(PrintService);
}
