import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocSection, DocSections, docText as text } from '../shared/doc-sections/doc-sections';
import { I18nService } from '../shared/i18n/i18n.service';
import { METHOD_TOOLS } from '../shared/tools';

/**
 * /sources: every tool's « Détails et sources » page, with the date it was last checked, then the
 * home page of each public body the tools cite.
 */
@Component({
  selector: 'app-sources-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocSections, RouterLink],
  templateUrl: './sources-page.html',
})
export class SourcesPage {
  readonly i18n = inject(I18nService);
  readonly tools = METHOD_TOOLS;
  readonly authorities = AUTHORITIES;
}

const AUTHORITIES: readonly DocSection[] = [
  {
    id: 'organismes',
    title: 'method.index.authorities.title',
    pieces: [
      text('method.index.authorities.body'),
      { kind: 'link', text: 'method.index.authorities.amf', url: 'https://lautorite.qc.ca' },
      {
        kind: 'link',
        text: 'method.index.authorities.fcac',
        url: 'https://www.canada.ca/fr/agence-consommation-matiere-financiere.html',
      },
      {
        kind: 'link',
        text: 'method.index.authorities.cra',
        url: 'https://www.canada.ca/fr/agence-revenu.html',
      },
      {
        kind: 'link',
        text: 'method.index.authorities.revenuQuebec',
        url: 'https://www.revenuquebec.ca/fr/',
      },
      {
        kind: 'link',
        text: 'method.index.authorities.bankOfCanada',
        url: 'https://www.banqueducanada.ca',
      },
      {
        kind: 'link',
        text: 'method.index.authorities.cmhc',
        url: 'https://www.cmhc-schl.gc.ca/fr',
      },
    ],
  },
];
