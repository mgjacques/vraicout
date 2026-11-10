import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../shared/i18n/i18n.service';
import { DocSection, DocSections, docText as text } from '../shared/doc-sections/doc-sections';

/** /confidentialite: the privacy policy Québec's Law 25 asks for, on the plan of the CAI guide. */
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
    id: 'renseignements',
    title: 'privacy.collected.title',
    pieces: [
      text('privacy.collected.intro'),
      {
        kind: 'list',
        items: [
          'privacy.collected.email',
          'privacy.collected.technical',
          'privacy.collected.analytics',
        ],
      },
      text('privacy.collected.profiling'),
    ],
  },
  {
    id: 'appareil',
    title: 'privacy.device.title',
    pieces: [text('privacy.device.body'), text('privacy.device.erase')],
  },
  { id: 'refus', title: 'privacy.refuse.title', pieces: [text('privacy.refuse.body')] },
  {
    id: 'tiers',
    title: 'privacy.sharing.title',
    pieces: [
      text('privacy.sharing.access'),
      text('privacy.sharing.cloudflare'),
      {
        kind: 'link',
        text: 'privacy.sharing.link',
        url: 'https://www.cloudflare.com/privacypolicy/',
      },
    ],
  },
  {
    id: 'conservation',
    title: 'privacy.retention.title',
    pieces: [text('privacy.retention.body')],
  },
  {
    id: 'responsable',
    title: 'privacy.officer.title',
    pieces: [
      text('privacy.officer.who'),
      { kind: 'mail' },
      text('privacy.officer.delay'),
      text('privacy.officer.complaint'),
      { kind: 'link', text: 'privacy.officer.link', url: 'https://www.cai.gouv.qc.ca' },
    ],
  },
  { id: 'modifications', title: 'privacy.changes.title', pieces: [text('privacy.changes.body')] },
];
