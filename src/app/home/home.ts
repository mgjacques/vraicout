import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { MessageKey } from '../shared/i18n/fr';
import { RichText } from '../shared/rich-text/rich-text';
import { I18nService } from '../shared/i18n/i18n.service';
import { ABOUT_ANCHOR } from '../shell/about-link';
import { SOURCE_URL } from '../shared/contact';
import { SUPPORT_URL } from '../shared/support';
import { TOOL_GROUPS } from '../shared/tools';

interface Principle {
  icon: string;
  title: MessageKey;
  body: MessageKey;
  /** An address to go further, shown under the paragraph. */
  link?: { href: string; label: MessageKey };
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, RichText, RouterLink],
  templateUrl: './home.html',
})
export class Home {
  readonly i18n = inject(I18nService);
  readonly groups = TOOL_GROUPS;
  readonly principles = PRINCIPLES;
  readonly aboutAnchor = ABOUT_ANCHOR;
  readonly supportUrl = SUPPORT_URL;

  /** The hero's buttons: down to a section of this page, without touching the address. */
  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const PRINCIPLES: readonly Principle[] = [
  {
    icon: 'pi-lock',
    title: 'about.principle.private.title',
    body: 'about.principle.private.body',
  },
  {
    icon: 'pi-book',
    title: 'about.principle.education.title',
    body: 'about.principle.education.body',
  },
  {
    icon: 'pi-calculator',
    title: 'about.principle.shown.title',
    body: 'about.principle.shown.body',
  },
  {
    icon: 'pi-github',
    title: 'about.principle.open.title',
    body: 'about.principle.open.body',
    link: { href: SOURCE_URL, label: 'footer.source' },
  },
];
