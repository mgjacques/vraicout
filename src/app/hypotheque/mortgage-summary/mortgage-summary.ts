import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { SelectButton } from 'primeng/selectbutton';
import { formatCount, formatMoney, formatPercent } from '../../shared/engine/formulas';
import { Figure } from '../../shared/figure/figure';
import { I18nService } from '../../shared/i18n/i18n.service';
import { OptionId, PersonId, TermFit } from '../engine/types';
import { personName } from '../person-name';
import { MortgageStore } from '../state/mortgage.store';

@Component({
  selector: 'app-mortgage-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Figure, FormsModule, InputNumber, SelectButton],
  templateUrl: './mortgage-summary.html',
})
export class MortgageSummary {
  readonly store = inject(MortgageStore);
  readonly i18n = inject(I18nService);
  readonly projection = this.store.projection;
  readonly death = this.store.death;
  readonly couple = computed(() => this.projection().input.couple);

  readonly heading = computed(() =>
    this.i18n.t('mortgage.summary.heading', {
      years: formatCount(this.projection().input.loan.years),
    }),
  );

  readonly personOptions = computed(() =>
    this.projection().people.map((id) => ({ label: this.name(id), value: id })),
  );

  /** "Si vous décédez…" alone on the loan, "Si Alex décède…" in couple mode. */
  readonly deathTitle = computed(() => {
    const { year, person } = this.death();
    return this.couple()
      ? this.i18n.t('mortgage.summary.deathOf', { name: this.name(person), year })
      : this.i18n.t('mortgage.summary.death', { year });
  });

  readonly survivor = computed(() => this.name(this.death().person === 'p1' ? 'p2' : 'p1'));

  readonly termSub = computed(() =>
    this.i18n.t(this.couple() ? 'mortgage.summary.termSubCouple' : 'mortgage.summary.termSub'),
  );

  readonly termPremiumNote = computed(() => {
    const { input, people } = this.projection();
    const years = people.map((id) => input.people[id].years);
    return years.every((value) => value === years[0])
      ? this.i18n.t('mortgage.summary.termPremiumHelp', { years: formatCount(years[0]) })
      : this.i18n.t('mortgage.summary.termPremiumHelpMixed');
  });

  readonly bankPremiumNote = computed(() =>
    this.i18n.t('mortgage.summary.bankPremiumHelp', {
      years: formatCount(this.projection().input.loan.years),
    }),
  );

  /** Faces the bank's melting coverage: a term policy's amount does not move. */
  readonly termLevelText = computed(() => {
    const { input } = this.projection();
    return input.couple
      ? this.i18n.t('mortgage.summary.termLevelCouple')
      : this.i18n.t('mortgage.summary.termLevel', {
          amount: formatMoney(input.people.p1.amount),
        });
  });

  /** The bank's coverage in the chosen year: it melts while the premium stays. */
  readonly meltingText = computed(() =>
    this.i18n.t('mortgage.summary.melting', { year: this.death().year }),
  );

  readonly meltingShare = computed(() =>
    this.i18n.t('mortgage.summary.meltingShare', {
      share: formatPercent(Math.round(this.death().balanceShare * 100)),
    }),
  );

  readonly gapText = computed(() => {
    const gap = this.projection().premiumGap;
    if (!gap) return '';
    return this.i18n.t(GAP_TEXT[gap.cheaper]);
  });

  name(id: PersonId): string {
    return personName(this.i18n, this.projection().input.people[id].label, id);
  }

  setYear(value: number | null): void {
    if (value !== null) this.store.deathYear.set(Math.round(value));
  }

  setPerson(value: PersonId | null): void {
    if (value) this.store.deathPerson.set(value);
  }

  fitText(fit: TermFit): string {
    const couple = this.couple();
    const name = this.name(fit.person);
    if (fit.endsEarly) {
      return this.i18n.t(couple ? 'mortgage.brief.endsEarlyOf' : 'mortgage.brief.endsEarly', {
        name,
        year: fit.endsEarly.year,
      });
    }
    return this.i18n.t(couple ? 'mortgage.brief.outlastsOf' : 'mortgage.brief.outlasts', {
      name,
      years: formatCount(fit.yearsAfter),
    });
  }
}

const GAP_TEXT: Record<OptionId, 'mortgage.brief.termCheaper' | 'mortgage.brief.bankCheaper'> = {
  term: 'mortgage.brief.termCheaper',
  bank: 'mortgage.brief.bankCheaper',
};
