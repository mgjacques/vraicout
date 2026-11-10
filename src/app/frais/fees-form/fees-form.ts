import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Account } from '../../shared/engine/money';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { MoneyInput } from '../../shared/money-input/money-input';
import { RichText } from '../../shared/rich-text/rich-text';
import { ResetButton } from '../../shared/reset/reset-button';
import { FeesField, FeesForm as Form } from '../engine/blank';
import { PortfolioId } from '../engine/types';
import { FeesStore } from '../state/fees.store';
import { NumberInput } from '../../shared/number-input/number-input';
import { cents, clampTo, fromPercent, toPercent } from '../../shared/engine/limits';
import { FEES_LIMITS as L } from '../engine/limits';
import { RequiredMark } from '../../shared/required-mark/required-mark';

@Component({
  selector: 'app-fees-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RequiredMark,
    RichText,
    FormsModule,
    MoneyInput,
    InputText,
    Message,
    ResetButton,
    Select,
    ToggleSwitch,
    NumberInput,
  ],
  templateUrl: './fees-form.html',
})
export class FeesForm {
  readonly limits = L;
  /** draft: the steps, one subject at a time. live: beside the results, with the reset. */
  readonly mode = input<'draft' | 'live'>('live');
  /** Sections to show; all by default. */
  readonly sections = input<readonly FeesSection[]>(ALL_SECTIONS);
  /** Forces field errors on or off; by default they show in live mode only. */
  readonly errors = input<boolean | null>(null);
  readonly store = inject(FeesStore);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly form = this.store.draft;
  readonly ids: readonly PortfolioId[] = ['a', 'b'];
  readonly years = computed(() => this.i18n.t('unit.years'));
  readonly percent = computed(() => this.i18n.t('unit.percent'));

  readonly accountOptions = computed(() =>
    (['tfsa', 'rrsp', 'taxable'] as const).map((value) => ({
      label: this.i18n.t(ACCOUNT_LABEL[value]),
      value,
    })),
  );
  readonly accountHelp = computed(() => this.i18n.t(ACCOUNT_HELP[this.form().account]));

  readonly missingLabel = computed(() =>
    this.store
      .missing()
      .map((field) => this.i18n.t(FIELD_LABEL[field]))
      .join(', '),
  );

  readonly returnPercent = computed(() => toPercent(this.form().grossReturn));
  readonly taxPercent = computed(() => toPercent(this.form().taxRate));
  readonly taxLaterPercent = computed(() => toPercent(this.form().taxRateLater));
  readonly inflationPercent = computed(() => toPercent(this.form().inflation));

  shows(section: FeesSection): boolean {
    return this.sections().includes(section);
  }

  invalid(field: FeesField): boolean {
    const errors = this.errors() ?? this.mode() === 'live';
    return errors && this.store.missing().includes(field);
  }

  /** Back to the starting figures, and to the introduction. */
  reset(): void {
    this.store.reset();
    void this.router.navigateByUrl('/frais');
  }

  portfolioTitle(id: PortfolioId): string {
    return this.i18n.t(id === 'a' ? 'fees.form.portfolioA' : 'fees.form.portfolioB');
  }

  merPercent(id: PortfolioId): number | null {
    return toPercent(this.form().portfolios[id].mer);
  }

  advisorPercent(id: PortfolioId): number | null {
    return toPercent(this.form().portfolios[id].advisorFee);
  }

  setInitial(value: number | null): void {
    this.edit((draft) => (draft.initialAmount = cents(value, L.initialAmount)));
  }

  setMonthly(value: number | null): void {
    this.edit((draft) => (draft.monthlyContribution = cents(value, L.monthlyContribution)));
  }

  setYears(value: number | null): void {
    this.edit(
      (draft) => (draft.years = value === null ? null : clampTo(Math.round(value), L.years)),
    );
  }

  setReturn(value: number | null): void {
    this.edit((draft) => (draft.grossReturn = fromPercent(value, L.returnPercent)));
  }

  setLabel(id: PortfolioId, value: string): void {
    this.edit((draft) => (draft.portfolios[id].label = value));
  }

  setMer(id: PortfolioId, value: number | null): void {
    this.edit((draft) => (draft.portfolios[id].mer = fromPercent(value, L.merPercent)));
  }

  setAdvisor(id: PortfolioId, value: number | null): void {
    this.edit((draft) => (draft.portfolios[id].advisorFee = fromPercent(value, L.advisorPercent)));
  }

  setAccount(value: Account): void {
    this.edit((draft) => (draft.account = value));
  }

  setTaxRate(value: number | null): void {
    this.edit((draft) => {
      const previous = draft.taxRate;
      draft.taxRate = fromPercent(value, L.taxPercent) ?? 0;
      // Until the person sets a different withdrawal rate, it follows today's rate.
      if (draft.taxRateLater === previous) draft.taxRateLater = draft.taxRate;
    });
  }

  setTaxRateLater(value: number | null): void {
    this.edit((draft) => (draft.taxRateLater = fromPercent(value, L.taxPercent) ?? 0));
  }

  setDrawdown(value: boolean): void {
    this.edit((draft) => (draft.drawdown.enabled = value));
  }

  setDrawdownYears(value: number | null): void {
    this.edit(
      (draft) =>
        (draft.drawdown.years =
          value === null ? null : clampTo(Math.round(value), L.drawdownYears)),
    );
  }

  setRealDollars(value: boolean): void {
    this.edit((draft) => (draft.realDollars = value));
  }

  setInflation(value: number | null): void {
    this.edit((draft) => (draft.inflation = fromPercent(value, L.inflationPercent) ?? 0));
  }

  private edit(change: (draft: Form) => unknown): void {
    const draft = structuredClone(this.form());
    change(draft);
    this.store.edit(draft);
  }
}

export type FeesSection = 'savings' | 'portfolios' | 'tax' | 'retirement';

const ALL_SECTIONS: readonly FeesSection[] = ['savings', 'portfolios', 'tax', 'retirement'];

const FIELD_LABEL: Record<FeesField, MessageKey> = {
  amount: 'fees.missing.amount',
  years: 'fees.form.years',
  return: 'fees.form.return',
  merA: 'fees.missing.merA',
  merB: 'fees.missing.merB',
  drawdownYears: 'fees.form.drawdownYears',
};

const ACCOUNT_LABEL: Record<Account, MessageKey> = {
  tfsa: 'drawer.account.tfsa',
  rrsp: 'drawer.account.rrsp',
  taxable: 'drawer.account.taxable',
};

const ACCOUNT_HELP: Record<Account, MessageKey> = {
  tfsa: 'drawer.accountHelp.tfsa',
  rrsp: 'drawer.accountHelp.rrsp',
  taxable: 'drawer.accountHelp.taxable',
};
