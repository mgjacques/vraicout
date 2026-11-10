import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { modelUrl } from '../../shared/contact';
import { DocSection, DocSections, docText as text } from '../../shared/doc-sections/doc-sections';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { SavingsFormula } from './savings-formula';

/** /epargne/methode: how the savings tool compounds, where its return and inflation come from, what it leaves out. */
@Component({
  selector: 'app-savings-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, DocSections, RouterLink],
  templateUrl: './savings-method.html',
})
export class SavingsMethod {
  readonly i18n = inject(I18nService);
  readonly sections = SECTIONS;
}

const SECTIONS: readonly DocSection[] = [
  {
    id: 'principe',
    title: 'method.principle.title',
    pieces: [text('savings.method.principle.body'), text('savings.method.principle.defaults')],
  },
  {
    id: 'calcul',
    title: 'method.calc.title',
    pieces: [
      text('savings.method.calc.rate'),
      text('savings.method.calc.month'),
      text('savings.method.calc.growth'),
      text('savings.method.calc.formula'),
      {
        kind: 'math',
        formula: SavingsFormula,
        symbols: (['r', 'i', 'P', 'D', 'm', 'a', 'S', 'F'] as const).map((symbol) => ({
          symbol,
          text: `savings.method.symbol.${symbol}` as const,
        })),
      },
      text('savings.method.calc.formulaZero'),
      text('savings.method.calc.interest'),
      text('savings.method.calc.late'),
      text('savings.method.calc.real'),
    ],
  },
  {
    id: 'reperes',
    title: 'method.ref.title',
    pieces: [
      text('savings.method.ref.return'),
      {
        kind: 'source',
        text: 'method.source.norms',
        url: 'https://institutpf.org/normes-hypotheses-projection',
      },
      text('method.ref.inflation'),
      {
        kind: 'source',
        text: 'sources.inflation',
        url: 'https://www.banqueducanada.ca/grandes-fonctions/politique-monetaire/inflation/',
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
          'savings.method.limits.return',
          'savings.method.limits.costs',
          'savings.method.limits.deposit',
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
        text: 'savings.method.more.model',
        url: modelUrl('modele-de-calcul-epargne.md'),
      },
    ],
  },
];
