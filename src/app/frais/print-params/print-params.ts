import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { formatCount, formatMoney, formatPercent } from '../../shared/engine/formulas';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ParamsGroup, ParamsSheet } from '../../shared/print/params-sheet';
import { PortfolioId } from '../engine/types';
import { FeesStore } from '../state/fees.store';

/** The fee comparison's figures, for the printed page. */
@Component({
  selector: 'app-fees-print-params',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParamsSheet],
  template: `<app-params-sheet [groups]="groups()" />`,
})
export class FeesPrintParams {
  private readonly i18n = inject(I18nService);
  private readonly store = inject(FeesStore);

  readonly groups = computed((): ParamsGroup[] => {
    const t = this.i18n.t.bind(this.i18n);
    const input = this.store.committed();
    const years = (value: number) => `${formatCount(value)}${t('unit.years')}`;
    const percent = (fraction: number) => formatPercent(fraction * 100);
    const yesNo = (value: boolean) => t(value ? 'print.params.yes' : 'print.params.no');

    const portfolio = (id: PortfolioId): ParamsGroup => {
      const fees = input.portfolios[id];
      const name = t(id === 'a' ? 'fees.form.portfolioA' : 'fees.form.portfolioB');
      return {
        title: fees.label.trim() ? `${name} : ${fees.label.trim()}` : name,
        rows: [
          { label: t('fees.form.mer'), value: percent(fees.mer) },
          { label: t('fees.form.advisor'), value: percent(fees.advisorFee) },
        ],
      };
    };

    const tax = [{ label: t('fees.form.account'), value: t(`drawer.account.${input.account}`) }];
    if (input.account !== 'tfsa') {
      tax.push({ label: t('drawer.taxRate'), value: percent(input.taxRate) });
    }
    if (input.account === 'rrsp') {
      tax.push({ label: t('drawer.taxRateLater'), value: percent(input.taxRateLater) });
    }

    const retirement = [{ label: t('fees.form.drawdown'), value: yesNo(input.drawdown.enabled) }];
    if (input.drawdown.enabled) {
      retirement.push({ label: t('fees.form.drawdownYears'), value: years(input.drawdown.years) });
    }

    return [
      {
        title: t('fees.form.savings'),
        rows: [
          { label: t('fees.form.initial'), value: formatMoney(input.initialAmount) },
          { label: t('fees.form.monthly'), value: formatMoney(input.monthlyContribution) },
          { label: t('fees.form.years'), value: years(input.years) },
          { label: t('fees.form.return'), value: percent(input.grossReturn) },
        ],
      },
      portfolio('a'),
      portfolio('b'),
      { title: t('fees.form.taxTitle'), rows: tax },
      { title: t('fees.form.retirement'), rows: retirement },
      {
        title: t('fees.form.inflationTitle'),
        rows: [
          { label: t('drawer.realDollars'), value: yesNo(input.realDollars) },
          { label: t('drawer.inflation'), value: percent(input.inflation) },
        ],
      },
    ];
  });
}
