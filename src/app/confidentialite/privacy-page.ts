import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../shared/i18n/i18n.service';
import { DocSection, DocSections, docText as text } from '../shared/doc-sections/doc-sections';

/** /confidentialite: what the app keeps, what it sends, and whom to ask (Québec's Law 25). */
@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocSections],
  templateUrl: './privacy-page.html',
})
export class PrivacyPage {
  readonly i18n = inject(I18nService);
  readonly sections = SECTIONS;
}

const SECTIONS: readonly DocSection[] = [
  {
    id: 'en-bref',
    title: 'privacy.brief.title',
    pieces: [
      {
        kind: 'list',
        items: ['privacy.brief.account', 'privacy.brief.local', 'privacy.brief.audience'],
      },
    ],
  },
  {
    id: 'appareil',
    title: 'privacy.device.title',
    pieces: [
      text('privacy.device.intro'),
      {
        kind: 'list',
        items: [
          'privacy.device.tools',
          'privacy.device.names',
          'privacy.device.theme',
          'privacy.device.access',
        ],
      },
      text('privacy.device.erase'),
      text('privacy.device.transfer'),
    ],
  },
  {
    id: 'audience',
    title: 'privacy.audience.title',
    pieces: [
      text('privacy.audience.what'),
      text('privacy.audience.counts'),
      text('privacy.audience.never'),
    ],
  },
  {
    id: 'hebergement',
    title: 'privacy.hosting.title',
    pieces: [
      text('privacy.hosting.body'),
      {
        kind: 'link',
        text: 'privacy.hosting.link',
        url: 'https://www.cloudflare.com/privacypolicy/',
      },
    ],
  },
  { id: 'liens', title: 'privacy.links.title', pieces: [text('privacy.links.body')] },
  { id: 'courriel', title: 'privacy.contact.title', pieces: [text('privacy.contact.body')] },
  {
    id: 'responsable',
    title: 'privacy.officer.title',
    pieces: [
      text('privacy.officer.who'),
      text('privacy.officer.rights'),
      { kind: 'mail' },
      text('privacy.officer.complaint'),
      { kind: 'link', text: 'privacy.officer.link', url: 'https://www.cai.gouv.qc.ca' },
    ],
  },
];
