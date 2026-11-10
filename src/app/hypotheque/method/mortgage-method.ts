import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { modelUrl } from '../../shared/contact';
import { DocSection, DocSections, docText as text } from '../../shared/doc-sections/doc-sections';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { MortgageFormula } from './mortgage-formula';

/** /hypotheque/methode: how the mortgage tool computes, where its rules come from, what it leaves out. */
@Component({
  selector: 'app-mortgage-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, DocSections, RouterLink],
  templateUrl: './mortgage-method.html',
})
export class MortgageMethod {
  readonly i18n = inject(I18nService);
  readonly sections = SECTIONS;
}

const FCAC_OPTIONAL =
  'https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/hypotheques/produit-assurance-hypothecaire.html';

const SECTIONS: readonly DocSection[] = [
  {
    id: 'principe',
    title: 'method.principle.title',
    pieces: [
      text('mortgage.method.principle.body'),
      text('mortgage.method.principle.premiums'),
      text('mortgage.method.principle.defaults'),
    ],
  },
  {
    id: 'calcul',
    title: 'method.calc.title',
    pieces: [
      text('mortgage.method.calc.payment'),
      {
        kind: 'source',
        text: 'mortgage.method.source.interestAct',
        url: 'https://laws-lois.justice.gc.ca/fra/lois/I-15/page-1.html',
      },
      text('mortgage.method.calc.formula'),
      {
        kind: 'math',
        formula: MortgageFormula,
        symbols: [
          { symbol: 't', text: 'mortgage.method.symbol.t' },
          { symbol: 'i', text: 'mortgage.method.symbol.i' },
          { symbol: 'L', text: 'mortgage.method.symbol.L' },
          { symbol: 'n', text: 'mortgage.method.symbol.n' },
          { symbol: 'M', text: 'mortgage.method.symbol.M' },
          { symbol: 'B', sub: 'k', text: 'mortgage.method.symbol.B' },
        ],
      },
      text('mortgage.method.calc.formulaZero'),
      text('mortgage.method.calc.bank'),
      { kind: 'source', text: 'mortgage.method.source.fcacOptional', url: FCAC_OPTIONAL },
      text('mortgage.method.calc.term'),
      text('mortgage.method.calc.paid'),
      text('mortgage.method.calc.death'),
      text('mortgage.method.calc.couple'),
    ],
  },
  {
    id: 'reperes',
    title: 'method.ref.title',
    pieces: [
      text('mortgage.method.ref.optional'),
      { kind: 'source', text: 'mortgage.method.source.fcacOptional', url: FCAC_OPTIONAL },
      text('mortgage.method.ref.cancel'),
      {
        kind: 'source',
        text: 'mortgage.method.source.distribution',
        url: 'https://www.legisquebec.gouv.qc.ca/fr/document/lc/D-9.2#se:440',
      },
      text('mortgage.method.ref.default'),
      {
        kind: 'source',
        text: 'mortgage.method.source.cmhc',
        url: 'https://www.cmhc-schl.gc.ca/fr/consommateurs/acheter-une-maison/assurance-pret-hypothecaire-pour-les-consommateurs/-faq--lassurance-pret-hypothecaire',
      },
      text('mortgage.method.ref.term'),
      {
        kind: 'source',
        text: 'mortgage.method.source.fcacLife',
        url: 'https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/assurance/vie.html',
      },
      text('mortgage.method.ref.premiums'),
    ],
  },
  {
    id: 'limites',
    title: 'method.limits.title',
    pieces: [
      {
        kind: 'list',
        items: [
          'mortgage.method.limits.rate',
          'mortgage.method.limits.balance',
          'mortgage.method.limits.premiums',
          'mortgage.method.limits.noDeath',
          'mortgage.method.limits.prepay',
          'mortgage.method.limits.differences',
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
        text: 'mortgage.method.more.model',
        url: modelUrl('modele-de-calcul-hypotheque.md'),
      },
      { kind: 'link', text: 'mortgage.method.more.amf', url: 'https://lautorite.qc.ca' },
    ],
  },
];
