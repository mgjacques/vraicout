import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../shared/i18n/i18n.service';
import { RichText } from '../shared/rich-text/rich-text';
import { Warning } from '../shared/warning/warning';
import { RESOURCE_SECTIONS } from './resources.data';

/** /ressources: books, podcasts, tools and public bodies, for going further than the site does. */
@Component({
  selector: 'app-ressources-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, RouterLink, Warning],
  templateUrl: './ressources-page.html',
})
export class RessourcesPage {
  readonly i18n = inject(I18nService);
  readonly sections = RESOURCE_SECTIONS;
}
