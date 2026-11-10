import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Panel } from 'primeng/panel';
import { formatMoney } from '../../shared/engine/formulas';
import { I18nService } from '../../shared/i18n/i18n.service';
import { personName } from '../person-name';
import { MortgageStore } from '../state/mortgage.store';

@Component({
  selector: 'app-mortgage-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel],
  templateUrl: './mortgage-table.html',
})
export class MortgageTable {
  private readonly store = inject(MortgageStore);
  readonly i18n = inject(I18nService);
  readonly money = formatMoney;
  readonly projection = this.store.projection;
  /** One coverage column per insured person. */
  readonly termColumns = computed(() => {
    const { input, people } = this.projection();
    return people.map((id) => ({
      id,
      label: input.couple
        ? this.i18n.t('mortgage.chart.termOf', {
            name: personName(this.i18n, input.people[id].label, id),
          })
        : this.i18n.t('mortgage.option.term'),
    }));
  });
}
