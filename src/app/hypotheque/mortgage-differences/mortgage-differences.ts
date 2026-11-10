import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { RichText } from '../../shared/rich-text/rich-text';

interface Difference {
  title: MessageKey;
  term: MessageKey;
  bank: MessageKey;
}

/** What the numbers do not show: who receives the money, and what happens when things change. */
@Component({
  selector: 'app-mortgage-differences',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText],
  templateUrl: './mortgage-differences.html',
})
export class MortgageDifferences {
  readonly i18n = inject(I18nService);
  readonly rows = ROWS;
  readonly notes: readonly MessageKey[] = [
    'mortgage.diff.note.optional',
    'mortgage.diff.note.cmhc',
    'mortgage.diff.note.replace',
  ];
}

const ROWS: readonly Difference[] = [
  {
    title: 'mortgage.diff.beneficiary',
    term: 'mortgage.diff.beneficiary.term',
    bank: 'mortgage.diff.beneficiary.bank',
  },
  {
    title: 'mortgage.diff.coverage',
    term: 'mortgage.diff.coverage.term',
    bank: 'mortgage.diff.coverage.bank',
  },
  {
    title: 'mortgage.diff.portability',
    term: 'mortgage.diff.portability.term',
    bank: 'mortgage.diff.portability.bank',
  },
  {
    title: 'mortgage.diff.couple',
    term: 'mortgage.diff.couple.term',
    bank: 'mortgage.diff.couple.bank',
  },
  {
    title: 'mortgage.diff.end',
    term: 'mortgage.diff.end.term',
    bank: 'mortgage.diff.end.bank',
  },
];
