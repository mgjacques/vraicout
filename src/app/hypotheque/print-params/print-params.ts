import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  formatCount,
  formatMoney,
  formatMoneyExact,
  formatPercent,
} from '../../shared/engine/formulas';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ParamsGroup, ParamsSheet } from '../../shared/print/params-sheet';
import { PersonId } from '../engine/types';
import { personName } from '../person-name';
import { MortgageStore } from '../state/mortgage.store';

/** The mortgage comparison's figures, for the printed page. */
@Component({
  selector: 'app-mortgage-print-params',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParamsSheet],
  template: `<app-params-sheet [groups]="groups()" />`,
})
export class MortgagePrintParams {
  private readonly i18n = inject(I18nService);
  private readonly store = inject(MortgageStore);

  readonly groups = computed((): ParamsGroup[] => {
    const t = this.i18n.t.bind(this.i18n);
    const input = this.store.committed();
    const years = (value: number) => `${formatCount(value)}${t('unit.years')}`;
    const people: PersonId[] = input.couple ? ['p1', 'p2'] : ['p1'];

    const term = (id: PersonId): ParamsGroup => ({
      title: input.couple
        ? t('mortgage.form.termOf', { name: personName(this.i18n, input.people[id].label, id) })
        : t('mortgage.form.termTitle'),
      rows: [
        { label: t('mortgage.form.termAmount'), value: formatMoney(input.people[id].amount) },
        { label: t('mortgage.form.termYears'), value: years(input.people[id].years) },
        {
          label: t('mortgage.form.termPremium'),
          value: formatMoneyExact(input.people[id].premium),
        },
      ],
    });

    return [
      {
        title: t('mortgage.form.loanTitle'),
        rows: [
          { label: t('mortgage.form.loanAmount'), value: formatMoney(input.loan.amount) },
          { label: t('mortgage.form.loanYears'), value: years(input.loan.years) },
          { label: t('mortgage.form.loanRate'), value: formatPercent(input.loan.rate * 100) },
          {
            label: t('mortgage.form.couple'),
            value: t(input.couple ? 'print.params.yes' : 'print.params.no'),
          },
        ],
      },
      {
        title: t('mortgage.form.bankTitle'),
        rows: [
          {
            label: t(
              input.couple ? 'mortgage.form.bankPremiumCouple' : 'mortgage.form.bankPremium',
            ),
            value: formatMoneyExact(input.bankPremium),
          },
        ],
      },
      ...people.map(term),
    ];
  });
}
