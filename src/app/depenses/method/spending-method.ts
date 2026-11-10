import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { modelUrl } from '../../shared/contact';
import { DocSection, DocSections, docText as text } from '../../shared/doc-sections/doc-sections';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';

/** /depenses/methode: how the frequent spending tool counts, invests and what it leaves out. */
@Component({
  selector: 'app-spending-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, DocSections, RouterLink],
  templateUrl: './spending-method.html',
})
export class SpendingMethod {
  readonly i18n = inject(I18nService);
  readonly sections = SECTIONS;
}

const SECTIONS: readonly DocSection[] = [
  {
    id: 'principe',
    title: 'method.principle.title',
    pieces: [
      text('spending.method.principle.body'),
      text('spending.method.principle.paid'),
      text('spending.method.principle.defaults'),
    ],
  },
  {
    id: 'calcul',
    title: 'method.calc.title',
    pieces: [
      text('spending.method.calc.times'),
      text('spending.method.calc.perYear'),
      text('spending.method.calc.total'),
      text('spending.method.calc.invested'),
      text('spending.method.calc.interest'),
    ],
  },
  {
    id: 'reperes',
    title: 'method.ref.title',
    pieces: [
      text('spending.method.ref.return'),
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
          'spending.method.limits.return',
          'spending.method.limits.tax',
          'spending.method.limits.growth',
          'spending.method.limits.real',
          'spending.method.limits.calendar',
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
        text: 'spending.method.more.model',
        url: modelUrl('modele-de-calcul-depenses.md'),
      },
    ],
  },
];
