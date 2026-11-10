import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { formatCount, formatPercent } from '../../shared/engine/formulas';
import { Figure } from '../../shared/figure/figure';
import { I18nService } from '../../shared/i18n/i18n.service';
import { PortfolioId, PortfolioResult } from '../engine/types';
import { FeesStore } from '../state/fees.store';

@Component({
  selector: 'app-fees-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Figure],
  templateUrl: './fees-summary.html',
})
export class FeesSummary {
  readonly store = inject(FeesStore);
  readonly i18n = inject(I18nService);
  readonly projection = this.store.projection;

  readonly cards = computed(() => {
    const { portfolios } = this.projection();
    return [portfolios.a, portfolios.b];
  });
  readonly taxed = computed(() => this.projection().input.account !== 'tfsa');
  readonly drawdown = computed(() => this.projection().drawdownMonths > 0);
  readonly heading = computed(() =>
    this.i18n.t('fees.summary.heading', { years: formatCount(this.projection().input.years) }),
  );

  /** The cheaper portfolio's name, for the sentences of the brief. */
  readonly cheaperLabel = computed(() => {
    const gap = this.projection().gap;
    return gap ? this.label(this.projection().portfolios[gap.cheaper]) : '';
  });

  label(portfolio: PortfolioResult): string {
    return (
      portfolio.label.trim() ||
      this.i18n.t(portfolio.id === 'a' ? 'fees.form.portfolioA' : 'fees.form.portfolioB')
    );
  }

  rate(portfolio: PortfolioResult): string {
    return this.i18n.t('fees.summary.rate', { rate: formatPercent(portfolio.feeRate * 100) });
  }

  share(portfolio: PortfolioResult): string {
    return this.i18n.t('fees.summary.costShare', {
      share: formatPercent(Math.round(portfolio.feeCostShare * 1000) / 10),
    });
  }

  incomeNote(): string {
    return this.i18n.t('fees.summary.incomeHelp', {
      years: formatCount(this.projection().input.drawdown.years),
    });
  }

  cardClass(id: PortfolioId): string {
    return id === 'a' ? 'card fee-card fee-a' : 'card fee-card fee-b';
  }
}
