import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { MessageKey } from '../i18n/fr';
import { I18nService } from '../i18n/i18n.service';

/** « Repartir de zéro », behind a confirmation that says what the tool will forget. */
@Component({
  selector: 'app-reset-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Dialog],
  templateUrl: './reset-button.html',
})
export class ResetButton {
  /** What the reset erases, in the tool's own words. */
  readonly effect = input.required<MessageKey>();
  readonly confirmed = output<void>();
  readonly i18n = inject(I18nService);
  readonly confirming = signal(false);

  confirm(): void {
    this.confirming.set(false);
    this.confirmed.emit();
  }
}
