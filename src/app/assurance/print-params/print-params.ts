import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { formatAge, formatCount, formatMoney, formatPercent } from '../../shared/engine/formulas';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ParamsGroup, ParamsSheet } from '../../shared/print/params-sheet';
import { ScenarioStore } from '../state/scenario.store';

/** The comparison's figures, for the printed page. */
@Component({
  selector: 'app-print-params',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParamsSheet],
  template: `<app-params-sheet [groups]="groups()" />`,
})
export class PrintParams {
  private readonly i18n = inject(I18nService);
  private readonly store = inject(ScenarioStore);

  readonly groups = computed((): ParamsGroup[] => {
    const t = this.i18n.t.bind(this.i18n);
    const { profile, permanent, term, params } = this.store.input();
    const years = (value: number) => `${formatCount(value)}${t('unit.years')}`;
    const percent = (fraction: number) => formatPercent(fraction * 100);
    const optional = (value: number | null) => (value === null ? '—' : formatMoney(value));

    const assumptions = [
      { label: t('drawer.return'), value: percent(params.annualReturn) },
      { label: t('drawer.reinvest'), value: percent(params.reinvestShare) },
      { label: t('drawer.extra'), value: formatMoney(params.extraSavingsMonthly) },
      { label: t('drawer.account'), value: t(`drawer.account.${params.account}`) },
    ];
    if (params.account !== 'tfsa') {
      assumptions.push({ label: t('drawer.taxRate'), value: percent(params.taxRate) });
    }
    if (params.account === 'rrsp') {
      assumptions.push({ label: t('drawer.taxRateLater'), value: percent(params.taxRateLater) });
    }
    assumptions.push({
      label: t('drawer.realDollars'),
      value: t(params.realDollars ? 'print.params.yes' : 'print.params.no'),
    });
    if (params.realDollars) {
      assumptions.push({ label: t('drawer.inflation'), value: percent(params.inflation) });
    }

    return [
      {
        title: t('drawer.profile'),
        rows: [
          { label: t('drawer.age'), value: years(profile.currentAge) },
          { label: t('drawer.horizon'), value: years(this.store.projection().horizonAge) },
        ],
      },
      {
        title: t('drawer.permanent'),
        rows: [
          { label: t('drawer.premium'), value: formatMoney(permanent.premium) },
          {
            label: t('drawer.periodicity'),
            value: t(`drawer.periodicity.${permanent.periodicity}`),
          },
          { label: t('drawer.deathBenefit'), value: formatMoney(permanent.deathBenefit) },
          {
            label: t('drawer.inForce'),
            value: t(permanent.inForce ? 'print.params.yes' : 'print.params.no'),
          },
          ...(permanent.inForce
            ? [{ label: t('drawer.cashNow'), value: formatMoney(permanent.cashValueNow) }]
            : []),
          { label: t('drawer.premiumYears'), value: years(permanent.premiumYearsRemaining) },
          { label: t('drawer.growth'), value: percent(permanent.projectedGrowth) },
          ...permanent.anchors.map((anchor) => ({
            label: t('print.params.anchor', { age: formatAge(anchor.age) }),
            value: t('print.params.anchorValues', {
              guaranteed: optional(anchor.guaranteed),
              projected: optional(anchor.projected),
            }),
          })),
        ],
      },
      {
        title: t('drawer.term'),
        rows: [
          { label: t('drawer.termPremium'), value: formatMoney(term.premium) },
          {
            label: t('drawer.termPeriodicity'),
            value: t(`drawer.periodicity.${term.periodicity}`),
          },
          { label: t('drawer.termDeath'), value: formatMoney(term.deathBenefit) },
          { label: t('drawer.termDuration'), value: t(`drawer.duration.${term.durationYears}`) },
        ],
      },
      { title: t('drawer.params'), rows: assumptions },
    ];
  });
}
