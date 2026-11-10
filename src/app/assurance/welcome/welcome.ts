import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { RichText } from '../../shared/rich-text/rich-text';
import { Warning } from '../../shared/warning/warning';
import { ScenarioStore } from '../state/scenario.store';

@Component({
  selector: 'app-welcome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, RichText, Button, Warning, RouterLink],
  templateUrl: './welcome.html',
})
export class Welcome {
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  /** Reached from the results through /introduction: the button goes back to them. */
  readonly hasResults = inject(ScenarioStore).committed;
  readonly purpose: readonly MessageKey[] = [
    'welcome.purpose.item1',
    'welcome.purpose.item2',
    'welcome.purpose.item3',
    'welcome.purpose.item4',
  ];
  readonly checks: readonly MessageKey[] = [
    'welcome.check.parents',
    'welcome.check.group',
    'welcome.check.loan',
    'welcome.check.other',
  ];
  readonly audienceFor: readonly MessageKey[] = ['welcome.audience.for1', 'welcome.audience.for2'];
  readonly audienceLess: readonly MessageKey[] = [
    'welcome.audience.less1',
    'welcome.audience.less2',
    'welcome.audience.less3',
    'welcome.audience.less4',
  ];

  start(): void {
    void this.router.navigateByUrl(
      this.hasResults() ? '/assurance/comparaison' : '/assurance/profil',
    );
  }
}
