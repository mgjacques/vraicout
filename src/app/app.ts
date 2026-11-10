import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageMeta } from './shared/seo/page-meta';
import { Shell } from './shell/shell';
import { SiteFooter } from './shell/site-footer/site-footer';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Shell, SiteFooter],
  templateUrl: './app.html',
})
export class App {
  constructor() {
    // Description, share tags, canonical link and `robots`, page by page.
    inject(PageMeta).start();
  }
}
