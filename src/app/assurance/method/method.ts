import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SOURCE_URL } from '../../shared/contact';
import { DocSection, DocSections, docText as text } from '../../shared/doc-sections/doc-sections';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import {
  InsuranceCashFormula,
  InsuranceGrowthFormula,
  InsuranceTaxFormula,
} from './insurance-formulas';

/** /assurance/methode: how the insurance tool computes, where its benchmarks come from, what it leaves out. */
@Component({
  selector: 'app-insurance-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, DocSections, RouterLink],
  templateUrl: './method.html',
})
export class InsuranceMethod {
  readonly i18n = inject(I18nService);
  readonly sections = SECTIONS;
}

const SECTIONS: readonly DocSection[] = [
  {
    id: 'principe',
    title: 'method.principle.title',
    pieces: [
      text('insurance.method.principle.body'),
      text('insurance.method.principle.share'),
      text('insurance.method.principle.extra'),
      text('insurance.method.principle.defaults'),
    ],
  },
  {
    id: 'calcul',
    title: 'method.calc.title',
    pieces: [
      text('insurance.method.calc.monthly'),
      text('insurance.method.calc.formula'),
      {
        kind: 'math',
        formula: InsuranceGrowthFormula,
        symbols: [
          { symbol: 'r', text: 'insurance.method.symbol.r' },
          { symbol: 'i', text: 'insurance.method.symbol.i' },
          { symbol: 'Δ', sub: 'k', text: 'insurance.method.symbol.gap' },
          { symbol: 's', text: 'insurance.method.symbol.s' },
          { symbol: 'u', text: 'insurance.method.symbol.u' },
          { symbol: 'B', sub: 'k', text: 'insurance.method.symbol.B' },
        ],
      },
      text('insurance.method.calc.cash'),
      text('insurance.method.calc.cashFormula'),
      {
        kind: 'math',
        formula: InsuranceCashFormula,
        symbols: [
          { symbol: 'V', sub: '1', text: 'insurance.method.symbol.V1' },
          { symbol: 'V', sub: '2', text: 'insurance.method.symbol.V2' },
          { symbol: 'm', sub: '1', text: 'insurance.method.symbol.m1' },
          { symbol: 'm', sub: '2', text: 'insurance.method.symbol.m2' },
          { symbol: 'm', text: 'insurance.method.symbol.m' },
          { symbol: 'V', text: 'insurance.method.symbol.V' },
        ],
      },
      text('insurance.method.calc.cashLinear'),
      text('insurance.method.calc.tax'),
      {
        kind: 'source',
        text: 'method.source.tfsa',
        url: 'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/compte-epargne-libre-impot/quest-ce-celi.html',
      },
      {
        kind: 'source',
        text: 'method.source.rrsp',
        url: 'https://www.canada.ca/fr/agence-revenu/services/formulaires-publications/publications/t4040/reer-autres-regimes-enregistres-retraite.html',
      },
      {
        kind: 'source',
        text: 'method.source.capitalGains',
        url: 'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/tout-votre-declaration-revenus/declaration-revenus/remplir-declaration-revenus/revenu-personnel/ligne-12700-gains-capital/calculer-declarer-vos-gains-pertes-capital.html',
      },
      text('insurance.method.calc.taxFormula'),
      {
        kind: 'math',
        formula: InsuranceTaxFormula,
        symbols: [
          { symbol: 'B', text: 'insurance.method.symbol.balance' },
          { symbol: 't', sub: 'R', text: 'insurance.method.symbol.tLater' },
          { symbol: 't', text: 'insurance.method.symbol.t' },
          { symbol: 'C', text: 'insurance.method.symbol.C' },
          { symbol: 'R', text: 'insurance.method.symbol.R' },
        ],
      },
      text('insurance.method.calc.real'),
      text('insurance.method.calc.breakEven'),
      text('insurance.method.calc.brief'),
    ],
  },
  {
    id: 'reperes',
    title: 'method.ref.title',
    pieces: [
      text('insurance.method.ref.return'),
      {
        kind: 'source',
        text: 'method.source.norms',
        url: 'https://institutpf.org/normes-hypotheses-projection',
      },
      text('insurance.method.ref.tax'),
      {
        kind: 'source',
        text: 'insurance.method.source.tax',
        url: 'https://cffp.recherche.usherbrooke.ca/outils-ressources/guide-mesures-fiscales/bareme-imposition-particuliers/',
      },
      text('method.ref.inflation'),
      {
        kind: 'source',
        text: 'sources.inflation',
        url: 'https://www.banqueducanada.ca/grandes-fonctions/politique-monetaire/inflation/',
      },
      text('insurance.method.ref.reinvest'),
      {
        kind: 'source',
        text: 'insurance.method.source.babbel',
        url: 'https://www.investmentnews.com/life-insurance-and-annuities/new-life-insurance-study-debunks-buy-term-invest-the-difference/63590',
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
          'insurance.method.limits.return',
          'insurance.method.limits.cashTax',
          'insurance.method.limits.guarantee',
          'method.limits.ceilings',
          'insurance.method.limits.interest',
          'insurance.method.limits.rrspDeath',
          'insurance.method.limits.value',
        ],
      },
      {
        kind: 'source',
        text: 'insurance.method.source.policyTax',
        url: 'https://laws-lois.justice.gc.ca/fra/lois/i-3.3/section-148.html',
      },
      {
        kind: 'source',
        text: 'insurance.method.source.rrspDeath',
        url: 'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/sujets/reer-regimes-connexes/deces-rentier-reer-participant-rpac/reer-non-echu.html',
      },
      text('insurance.method.limits.rules'),
    ],
  },
  {
    id: 'plus-loin',
    title: 'method.more.title',
    pieces: [
      text('method.more.body'),
      {
        kind: 'link',
        text: 'insurance.method.more.model',
        url: `${SOURCE_URL}/blob/develop/docs/modele-de-calcul.md`,
      },
      {
        kind: 'link',
        text: 'insurance.method.more.fcac',
        url: 'https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/assurance/vie.html',
      },
      {
        kind: 'link',
        text: 'insurance.method.more.amfSteps',
        url: 'https://lautorite.qc.ca/grand-public/assurance/assurance-vie/5-etapes-a-suivre-avant-de-vous-assurer',
      },
      { kind: 'link', text: 'insurance.method.more.amf', url: 'https://lautorite.qc.ca' },
    ],
  },
];
