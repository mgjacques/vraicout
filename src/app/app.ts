import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccessGate } from './shared/access/access-gate';
import { AccessService } from './shared/access/access.service';
import { PageMeta } from './shared/seo/page-meta';
import { Shell } from './shell/shell';
import { SiteFooter } from './shell/site-footer/site-footer';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccessGate, RouterOutlet, Shell, SiteFooter],
  templateUrl: './app.html',
})
export class App {
  readonly access = inject(AccessService);

  constructor() {
    // Description, share tags, canonical link and `robots`, page by page.
    inject(PageMeta).start();
  }
}
