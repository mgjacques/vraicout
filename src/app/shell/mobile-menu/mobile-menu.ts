import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Drawer } from 'primeng/drawer';
import { I18nService } from '../../shared/i18n/i18n.service';
import { TOOL_GROUPS } from '../../shared/tools';
import { ABOUT_ANCHOR, goToAbout } from '../about-link';
import { ClearDataDialog } from '../clear-data/clear-data-dialog';
import { SupportLink } from '../support-link';
import { ThemeToggle } from '../theme-toggle';

/**
 * The header's content on a narrow screen, behind the hamburger: support and theme at the
 * top, the home page, the tools in their two groups, « Ressources » and « À propos », then « Effacer vos données » at the very bottom.
 */
@Component({
  selector: 'app-mobile-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Drawer, RouterLink, RouterLinkActive, ClearDataDialog, SupportLink, ThemeToggle],
  templateUrl: './mobile-menu.html',
  // p-drawer only honours Escape when its z-index tops PrimeNG's own stack, which it does not here.
  host: { '(document:keydown.escape)': 'visible.set(false)' },
})
export class MobileMenu {
  readonly i18n = inject(I18nService);
  readonly groups = TOOL_GROUPS;
  readonly aboutAnchor = ABOUT_ANCHOR;
  private readonly router = inject(Router);
  readonly visible = model(false);
  readonly confirming = signal(false);

  goToAbout(event: MouseEvent): void {
    this.visible.set(false);
    goToAbout(event, this.router);
  }

  askClear(): void {
    this.visible.set(false);
    this.confirming.set(true);
  }
}
