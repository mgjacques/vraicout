import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { I18nService } from '../i18n/i18n.service';
import { AccessService } from './access.service';

/** What stands in for the whole app until the password is entered. */
@Component({
  selector: 'app-access-gate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, FormsModule, InputText],
  templateUrl: './access-gate.html',
})
export class AccessGate {
  readonly i18n = inject(I18nService);
  private readonly access = inject(AccessService);
  readonly password = signal('');
  readonly wrong = signal(false);

  async submit(): Promise<void> {
    this.wrong.set(!(await this.access.unlock(this.password())));
  }
}
