import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Panel } from 'primeng/panel';
import { formatMoney } from '../../shared/engine/formulas';
import { I18nService } from '../../shared/i18n/i18n.service';
import { FeesStore } from '../state/fees.store';

@Component({
  selector: 'app-fees-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel],
  templateUrl: './fees-table.html',
})
export class FeesTable {
  private readonly store = inject(FeesStore);
  readonly i18n = inject(I18nService);
  readonly money = formatMoney;
  readonly rows = computed(() => this.store.projection().rows);
  readonly names = computed(() => {
    const { portfolios } = this.store.projection();
    return {
      a: portfolios.a.label.trim() || this.i18n.t('fees.form.portfolioA'),
      b: portfolios.b.label.trim() || this.i18n.t('fees.form.portfolioB'),
    };
  });
}
