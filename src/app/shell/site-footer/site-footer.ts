import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { APP_NAME } from '../../shared/app-name';
import { CONTACT_ADDRESS, SOURCE_URL } from '../../shared/contact';
import { I18nService } from '../../shared/i18n/i18n.service';
import { SUPPORT_URL } from '../../shared/support';
import { TOOL_GROUPS } from '../../shared/tools';
import { ABOUT_ANCHOR, goToAbout } from '../about-link';
import { BrandMark } from '../brand-mark';

/** The footer under every page: the tools, the project, how to reach us and where the code is. */
@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BrandMark],
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  readonly i18n = inject(I18nService);
  readonly appName = APP_NAME;
  readonly groups = TOOL_GROUPS;
  readonly aboutAnchor = ABOUT_ANCHOR;
  readonly address = CONTACT_ADDRESS;
  readonly mailto = 'mailto:' + CONTACT_ADDRESS;
  readonly sourceUrl = SOURCE_URL;
  readonly supportUrl = SUPPORT_URL;
  private readonly router = inject(Router);

  goToAbout(event: MouseEvent): void {
    goToAbout(event, this.router);
  }
}
