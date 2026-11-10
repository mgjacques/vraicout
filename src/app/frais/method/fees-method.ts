import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SOURCE_URL } from '../../shared/contact';
import { DocSection, DocSections, docText as text } from '../../shared/doc-sections/doc-sections';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { FeesDrawdownFormula, FeesGrowthFormula } from './fees-formulas';

/** /frais/methode: how the fees tool computes, where its benchmarks come from, what it leaves out. */
@Component({
  selector: 'app-fees-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, DocSections, RouterLink],
  templateUrl: './fees-method.html',
})
export class FeesMethod {
  readonly i18n = inject(I18nService);
  readonly sections = SECTIONS;
}

const SECTIONS: readonly DocSection[] = [
  {
    id: 'comparaison',
    title: 'method.principle.title',
    pieces: [
      text('fees.method.compare.body'),
      text('fees.method.compare.cost'),
      text('fees.method.compare.defaults'),
    ],
  },
  {
    id: 'calcul',
    title: 'method.calc.title',
    pieces: [
      text('fees.method.calc.monthly'),
      text('fees.method.calc.formula'),
      {
        kind: 'math',
        formula: FeesGrowthFormula,
        symbols: [
          { symbol: 'r', text: 'fees.method.symbol.r' },
          { symbol: 'c', text: 'fees.method.symbol.c' },
          { symbol: 'i', text: 'fees.method.symbol.i' },
          { symbol: 'f', text: 'fees.method.symbol.f' },
          { symbol: 'B', sub: 'k', text: 'fees.method.symbol.B' },
          { symbol: 'D', text: 'fees.method.symbol.D' },
        ],
      },
      text('fees.method.calc.rrsp'),
      {
        kind: 'source',
        text: 'method.source.rrsp',
        url: 'https://www.canada.ca/fr/agence-revenu/services/formulaires-publications/publications/t4040/reer-autres-regimes-enregistres-retraite.html',
      },
      text('fees.method.calc.tax'),
      {
        kind: 'source',
        text: 'method.source.tfsa',
        url: 'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/compte-epargne-libre-impot/quest-ce-celi.html',
      },
      {
        kind: 'source',
        text: 'method.source.capitalGains',
        url: 'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/tout-votre-declaration-revenus/declaration-revenus/remplir-declaration-revenus/revenu-personnel/ligne-12700-gains-capital/calculer-declarer-vos-gains-pertes-capital.html',
      },
      text('fees.method.calc.drawdown'),
      text('fees.method.calc.drawdownFormula'),
      {
        kind: 'math',
        formula: FeesDrawdownFormula,
        symbols: [
          { symbol: 'j', text: 'fees.method.symbol.j' },
          { symbol: 'π', text: 'fees.method.symbol.pi' },
          { symbol: 'g', text: 'fees.method.symbol.g' },
          { symbol: 'q', text: 'fees.method.symbol.q' },
          { symbol: 'B', text: 'fees.method.symbol.balance' },
          { symbol: 'N', text: 'fees.method.symbol.N' },
          { symbol: 'W', sub: 'k', text: 'fees.method.symbol.W' },
        ],
      },
      text('fees.method.calc.drawdownZero'),
    ],
  },
  {
    id: 'reperes',
    title: 'method.ref.title',
    pieces: [
      text('fees.method.ref.return'),
      {
        kind: 'source',
        text: 'method.source.norms',
        url: 'https://institutpf.org/normes-hypotheses-projection',
      },
      text('fees.method.ref.mer'),
      {
        kind: 'source',
        text: 'fees.method.source.mer',
        url: 'https://www.investmentexecutive.com/news/research-and-markets/fund-industry-generated-nearly-31b-from-mers-in-2023/',
      },
      {
        kind: 'source',
        text: 'fees.sources.fundFacts',
        url: 'https://lautorite.qc.ca/fileadmin/lautorite/reglementation/valeurs-mobilieres/81-101/2022-04-14/2022avril14-81-101-ig-final-fr.pdf',
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
          'fees.method.limits.return',
          'fees.method.limits.daily',
          'fees.method.limits.tax',
          'method.limits.ceilings',
          'fees.method.limits.advice',
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
        text: 'fees.method.more.model',
        url: `${SOURCE_URL}/blob/develop/docs/modele-de-calcul-frais.md`,
      },
      { kind: 'link', text: 'fees.sources.amf', url: 'https://lautorite.qc.ca' },
    ],
  },
];
