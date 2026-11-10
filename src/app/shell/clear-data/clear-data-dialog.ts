import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { I18nService } from '../../shared/i18n/i18n.service';
import { clearSaved } from '../../shared/storage/device-storage';

/** « Effacer vos données ? »: asked from the avatar menu and from the menu panel. */
@Component({
  selector: 'app-clear-data-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Dialog],
  templateUrl: './clear-data-dialog.html',
})
export class ClearDataDialog {
  readonly i18n = inject(I18nService);
  readonly visible = model(false);

  /** A full reload: every tool starts again from zero, on the home page. */
  clear(): void {
    clearSaved();
    location.assign(document.baseURI);
  }
}
