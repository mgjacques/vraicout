import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';
import { MessageKey } from '../shared/i18n/fr';
import { I18nService } from '../shared/i18n/i18n.service';
import { RichText } from '../shared/rich-text/rich-text';
import { applyCode, exportCode, readCode } from '../shared/storage/data-transfer';

/** Query flag set by the reload that follows an import, so the page can say it worked. */
export const IMPORTED_FLAG = 'importe';

/**
 * /donnees: the kept figures as a code to copy, and a field to paste one back.
 * Every tool reads its figures once, when it starts, so an import reloads the whole site.
 */
@Component({
  selector: 'app-transfer-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Dialog, Message, Textarea, RichText],
  templateUrl: './transfer-page.html',
})
export class TransferPage {
  readonly i18n = inject(I18nService);
  readonly code = exportCode();
  readonly imported = inject(ActivatedRoute).snapshot.queryParamMap.has(IMPORTED_FLAG);

  readonly copyStatus = signal<MessageKey | null>(null);
  readonly pasted = signal('');
  readonly importError = signal<MessageKey | null>(null);
  readonly confirming = signal(false);
  private pending: Record<string, string> | null = null;

  async copy(field: HTMLTextAreaElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code);
      this.copyStatus.set('transfer.export.copied');
    } catch {
      // Clipboard refused: select the code so the reader can copy it by hand.
      field.select();
      this.copyStatus.set('transfer.export.copyFailed');
    }
  }

  onPaste(value: string): void {
    this.pasted.set(value);
    this.importError.set(null);
  }

  askImport(): void {
    this.pending = readCode(this.pasted());
    if (!this.pending) {
      this.importError.set('transfer.import.invalid');
      return;
    }
    this.confirming.set(true);
  }

  confirmImport(): void {
    this.confirming.set(false);
    if (!this.pending || !applyCode(this.pending)) {
      this.importError.set('transfer.import.blocked');
      return;
    }
    location.assign(`${document.baseURI}donnees?${IMPORTED_FLAG}`);
  }
}
