import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SOURCE_URL } from '../../shared/contact';
import { DocSection, DocSections, docText as text } from '../../shared/doc-sections/doc-sections';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';

/** /partage/methode: how the split tool computes, what backs it, what it leaves out. */
@Component({
  selector: 'app-split-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, DocSections, RouterLink],
  templateUrl: './split-method.html',
})
export class SplitMethod {
  readonly i18n = inject(I18nService);
  readonly sections = SECTIONS;
}

const SECTIONS: readonly DocSection[] = [
  {
    id: 'principe',
    title: 'method.principle.title',
    pieces: [
      text('split.method.principle.body'),
      text('split.method.principle.other'),
      text('split.method.principle.defaults'),
    ],
  },
  {
    id: 'calcul',
    title: 'method.calc.title',
    pieces: [
      text('split.method.calc.annual'),
      text('split.method.calc.share'),
      text('split.method.calc.rounding'),
      text('split.method.calc.bill'),
      text('split.method.calc.zero'),
    ],
  },
  {
    id: 'reperes',
    title: 'method.ref.title',
    pieces: [
      text('split.method.ref.net'),
      text('split.method.ref.progressive'),
      {
        kind: 'source',
        text: 'split.method.source.quebecRates',
        url: 'https://www.revenuquebec.ca/fr/citoyens/declaration-de-revenus/produire-votre-declaration-de-revenus/taux-dimposition/',
      },
    ],
  },
  {
    id: 'limites',
    title: 'method.limits.title',
    pieces: [
      {
        kind: 'list',
        items: [
          'split.method.limits.tax',
          'split.method.limits.same',
          'split.method.limits.other',
          'split.method.limits.one',
        ],
      },
    ],
  },
  {
    id: 'plus-loin',
    title: 'method.more.title',
    pieces: [
      text('method.more.body'),
      {
        kind: 'link',
        text: 'split.method.more.model',
        url: `${SOURCE_URL}/blob/develop/docs/modele-de-calcul-partage.md`,
      },
    ],
  },
];
