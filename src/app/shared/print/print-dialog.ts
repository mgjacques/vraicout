import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { I18nService } from '../i18n/i18n.service';
import { PrintService } from './print.service';

/** Picks the sections of the current page to print. The warning and the footer always print. */
@Component({
  selector: 'app-print-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Checkbox, Dialog, FormsModule],
  templateUrl: './print-dialog.html',
})
export class PrintDialog {
  readonly i18n = inject(I18nService);
  readonly printer = inject(PrintService);
  /** Reread from the device each time the dialog opens. */
  readonly omit = linkedSignal(() => (this.printer.dialogOpen() ? this.printer.omitted() : []));
  readonly allTicked = computed(() => this.omit().length === 0);
  readonly noneTicked = computed(() =>
    this.printer.sections().every((section) => this.omit().includes(section.id)),
  );

  set(id: string, ticked: boolean): void {
    this.omit.update((omit) => (ticked ? omit.filter((other) => other !== id) : [...omit, id]));
  }

  toggleAll(): void {
    this.omit.set(this.allTicked() ? this.printer.sections().map((section) => section.id) : []);
  }

  print(): void {
    this.printer.printWithout(this.omit());
  }
}
