import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { RichText } from '../../shared/rich-text/rich-text';
import { Warning } from '../../shared/warning/warning';
import { FeesStore } from '../state/fees.store';

@Component({
  selector: 'app-fees-welcome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, RichText, Button, Warning, RouterLink],
  templateUrl: './fees-welcome.html',
})
export class FeesWelcome {
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  /** Reached from the results through /introduction: the button goes back to them. */
  readonly hasResults = inject(FeesStore).finished;
  readonly audienceFor: readonly MessageKey[] = [
    'fees.welcome.audience.for1',
    'fees.welcome.audience.for2',
  ];
  readonly audienceLess: readonly MessageKey[] = [
    'fees.welcome.audience.less2',
    'fees.welcome.audience.less3',
  ];
  readonly checks: readonly MessageKey[] = [
    'fees.welcome.check.facts',
    'fees.welcome.check.statement',
    'fees.welcome.check.advisor',
  ];

  start(): void {
    void this.router.navigateByUrl(this.hasResults() ? '/frais/comparaison' : '/frais/profil');
  }
}
