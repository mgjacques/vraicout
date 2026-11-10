import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { Warning } from '../../shared/warning/warning';
import { MortgageStore } from '../state/mortgage.store';

@Component({
  selector: 'app-mortgage-welcome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, Button, RouterLink, Warning],
  templateUrl: './mortgage-welcome.html',
})
export class MortgageWelcome {
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  /** Reached from the results through /introduction: the button goes back to them. */
  readonly hasResults = inject(MortgageStore).finished;
  readonly audienceFor: readonly MessageKey[] = [
    'mortgage.welcome.audience.for1',
    'mortgage.welcome.audience.for2',
  ];
  readonly audienceLess: readonly MessageKey[] = [
    'mortgage.welcome.audience.less1',
    'mortgage.welcome.audience.less3',
  ];
  readonly checks: readonly MessageKey[] = [
    'mortgage.welcome.check.bank',
    'mortgage.welcome.check.statement',
    'mortgage.welcome.check.term',
  ];

  start(): void {
    void this.router.navigateByUrl(
      this.hasResults() ? '/hypotheque/comparaison' : '/hypotheque/profil',
    );
  }
}
