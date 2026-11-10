import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { modelUrl } from '../../shared/contact';
import { DocSection, DocSections, docText as text } from '../../shared/doc-sections/doc-sections';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';

/** /heures/methode: how the hours tool computes, where its tax rates come from, what it leaves out. */
@Component({
  selector: 'app-hours-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, DocSections, RouterLink],
  templateUrl: './hours-method.html',
})
export class HoursMethod {
  readonly i18n = inject(I18nService);
  readonly sections = SECTIONS;
}

const SECTIONS: readonly DocSection[] = [
  {
    id: 'principe',
    title: 'method.principle.title',
    pieces: [
      text('hours.method.principle.body'),
      text('hours.method.principle.net'),
      text('hours.method.principle.defaults'),
    ],
  },
  {
    id: 'calcul',
    title: 'method.calc.title',
    pieces: [
      text('hours.method.calc.annual'),
      text('hours.method.calc.costs'),
      text('hours.method.calc.hourly'),
      text('hours.method.calc.hours'),
      text('hours.method.calc.days'),
      text('hours.method.calc.recurrence'),
    ],
  },
  {
    id: 'reperes',
    title: 'method.ref.title',
    pieces: [
      text('hours.method.ref.tax'),
      {
        kind: 'source',
        text: 'hours.method.source.tax',
        url: 'https://www.revenuquebec.ca/fr/entreprises/taxes/tpstvh-et-tvq/perception-de-la-tps-et-de-la-tvq/calcul-des-taxes/',
      },
      text('hours.method.ref.exempt'),
      text('hours.method.ref.weeks'),
    ],
  },
  {
    id: 'limites',
    title: 'method.limits.title',
    pieces: [
      {
        kind: 'list',
        items: [
          'hours.method.limits.extra',
          'hours.method.limits.commute',
          'hours.method.limits.tax',
          'hours.method.limits.rounding',
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
        text: 'hours.method.more.model',
        url: modelUrl('modele-de-calcul-heures.md'),
      },
    ],
  },
];
