import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SOURCE_URL } from '../../shared/contact';
import {
  DocSection,
  DocSections,
  MathSymbol,
  docText as text,
} from '../../shared/doc-sections/doc-sections';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { MarginalFormula } from './marginal-formula';

/** /impot/methode: how the marginal rate tool taxes an income, where its brackets come from, what it leaves out. */
@Component({
  selector: 'app-marginal-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolBreadcrumb, DocSections, RouterLink],
  templateUrl: './marginal-method.html',
})
export class MarginalMethod {
  readonly i18n = inject(I18nService);
  readonly sections = SECTIONS;
}

const SYMBOLS: readonly MathSymbol[] = [
  { symbol: 'm', text: 'marginal.method.symbol.m' },
  { symbol: 't', sub: 'f', text: 'marginal.method.symbol.tf' },
  { symbol: 'p', text: 'marginal.method.symbol.p' },
  { symbol: 'a', text: 'marginal.method.symbol.a' },
  { symbol: 't', sub: 'q', text: 'marginal.method.symbol.tq' },
  { symbol: 'I', sub: 'f', text: 'marginal.method.symbol.If' },
  { symbol: 'T', sub: 'f', text: 'marginal.method.symbol.Tf' },
  { symbol: 'R', text: 'marginal.method.symbol.R' },
  { symbol: 'c', text: 'marginal.method.symbol.c' },
  { symbol: 'B', sub: 'f', text: 'marginal.method.symbol.Bf' },
  { symbol: 'I', sub: 'q', text: 'marginal.method.symbol.Iq' },
  { symbol: 'T', sub: 'q', text: 'marginal.method.symbol.Tq' },
  { symbol: 'B', sub: 'q', text: 'marginal.method.symbol.Bq' },
];

const SECTIONS: readonly DocSection[] = [
  {
    id: 'principe',
    title: 'method.principle.title',
    pieces: [
      text('marginal.method.principle.body'),
      text('marginal.method.principle.income'),
      text('marginal.method.principle.defaults'),
    ],
  },
  {
    id: 'calcul',
    title: 'method.calc.title',
    pieces: [
      text('marginal.method.calc.quebec'),
      text('marginal.method.calc.federal'),
      text('marginal.method.calc.phase'),
      text('marginal.method.calc.abatement'),
      text('marginal.method.calc.zero'),
      text('marginal.method.calc.formula'),
      { kind: 'math', formula: MarginalFormula, symbols: SYMBOLS },
      text('marginal.method.calc.formulaZero'),
      text('marginal.method.calc.average'),
      text('marginal.method.calc.extra'),
    ],
  },
  {
    id: 'reperes',
    title: 'method.ref.title',
    pieces: [
      text('marginal.method.ref.quebec'),
      {
        kind: 'source',
        text: 'marginal.method.source.quebec',
        url: 'https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/finances/publications-adm/parametres/AUTFR_RegimeImpot2026.pdf',
      },
      text('marginal.method.ref.federal'),
      {
        kind: 'source',
        text: 'marginal.method.source.federal',
        url: 'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/taux-imposition-tranches-revenu/annee-en-cours.html',
      },
      text('marginal.method.ref.basic'),
      {
        kind: 'source',
        text: 'marginal.method.source.basic',
        url: 'https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/td1-ws/td1-ws-26f.pdf',
      },
      text('marginal.method.ref.change'),
    ],
  },
  {
    id: 'limites',
    title: 'method.limits.title',
    pieces: [
      {
        kind: 'list',
        items: [
          'marginal.method.limits.contributions',
          'marginal.method.limits.credits',
          'marginal.method.limits.benefits',
          'marginal.method.limits.income',
          'marginal.method.limits.amt',
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
        text: 'marginal.method.more.model',
        url: `${SOURCE_URL}/blob/develop/docs/modele-de-calcul-impot.md`,
      },
    ],
  },
];
