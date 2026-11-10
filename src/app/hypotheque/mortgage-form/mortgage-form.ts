import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { MoneyInput } from '../../shared/money-input/money-input';
import { ResetButton } from '../../shared/reset/reset-button';
import { DEFAULT_BANK_PREMIUM, MortgageField, MortgageForm as Form } from '../engine/blank';
import { PersonId } from '../engine/types';
import { MortgageStore } from '../state/mortgage.store';
import { personName } from '../person-name';
import { NumberInput } from '../../shared/number-input/number-input';
import { cents, fromPercent, whole } from '../../shared/engine/limits';
import { MORTGAGE_LIMITS as L } from '../engine/limits';
import { RequiredMark } from '../../shared/required-mark/required-mark';

@Component({
  selector: 'app-mortgage-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RequiredMark,
    FormsModule,
    InputText,
    MoneyInput,
    Message,
    ResetButton,
    ToggleSwitch,
    NumberInput,
  ],
  templateUrl: './mortgage-form.html',
})
export class MortgageForm {
  readonly limits = L;
  /** draft: the steps, one subject at a time. live: beside the results, with the reset. */
  readonly mode = input<'draft' | 'live'>('live');
  /** Sections to show; all by default. */
  readonly sections = input<readonly MortgageSection[]>(ALL_SECTIONS);
  /** Forces field errors on or off; by default they show in live mode only. */
  readonly errors = input<boolean | null>(null);
  readonly store = inject(MortgageStore);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly form = this.store.draft;
  readonly years = computed(() => this.i18n.t('unit.years'));
  readonly percent = computed(() => this.i18n.t('unit.percent'));
  readonly people = computed((): PersonId[] => (this.form().couple ? ['p1', 'p2'] : ['p1']));

  readonly missingLabel = computed(() =>
    this.store
      .missing()
      .map((field) => fieldLabel(this.i18n, field, this.form()))
      .join(', '),
  );

  readonly ratePercent = computed(() => {
    const rate = this.form().loan.rate;
    return rate === null ? null : Math.round(rate * 10_000) / 100;
  });

  shows(section: MortgageSection): boolean {
    return this.sections().includes(section);
  }

  invalid(field: MortgageField): boolean {
    const errors = this.errors() ?? this.mode() === 'live';
    return errors && this.store.missing().includes(field);
  }

  /** Back to the starting figures, and to the introduction. */
  reset(): void {
    this.store.reset();
    void this.router.navigateByUrl('/hypotheque');
  }

  /** The person's name, or "Personne 1" / "Personne 2" until one is typed. */
  name(id: PersonId): string {
    return personName(this.i18n, this.form().people[id].label, id);
  }

  termTitle(id: PersonId): string {
    return this.form().couple
      ? this.i18n.t('mortgage.form.termOf', { name: this.name(id) })
      : this.i18n.t('mortgage.form.termTitle');
  }

  field(id: PersonId, kind: 'Amount' | 'Years' | 'Premium'): MortgageField {
    return `term${kind}${id === 'p1' ? '1' : '2'}`;
  }

  setLoanAmount(value: number | null): void {
    this.edit((draft) => (draft.loan.amount = whole(value, L.loanAmount)));
  }

  setLoanYears(value: number | null): void {
    this.edit((draft) => (draft.loan.years = whole(value, L.years)));
  }

  setLoanRate(value: number | null): void {
    this.edit((draft) => (draft.loan.rate = fromPercent(value, L.ratePercent)));
  }

  setCouple(value: boolean): void {
    this.edit((draft) => {
      draft.couple = value;
      // Until the person types the bank's own figure, the starting premium follows the number of borrowers.
      const [from, to] = value
        ? [DEFAULT_BANK_PREMIUM.single, DEFAULT_BANK_PREMIUM.couple]
        : [DEFAULT_BANK_PREMIUM.couple, DEFAULT_BANK_PREMIUM.single];
      if (draft.bankPremium === from) draft.bankPremium = to;
    });
    if (!value) this.store.deathPerson.set('p1');
  }

  setLabel(id: PersonId, value: string): void {
    this.edit((draft) => (draft.people[id].label = value));
  }

  setBankPremium(value: number | null): void {
    this.edit((draft) => (draft.bankPremium = cents(value, L.premium)));
  }

  setTermAmount(id: PersonId, value: number | null): void {
    this.edit((draft) => (draft.people[id].amount = whole(value, L.termAmount)));
  }

  setTermYears(id: PersonId, value: number | null): void {
    this.edit((draft) => (draft.people[id].years = whole(value, L.years)));
  }

  setTermPremium(id: PersonId, value: number | null): void {
    this.edit((draft) => (draft.people[id].premium = cents(value, L.premium)));
  }

  private edit(change: (draft: Form) => unknown): void {
    const draft = structuredClone(this.form());
    change(draft);
    this.store.edit(draft);
  }
}

export type MortgageSection = 'loan' | 'bank' | 'term';

const ALL_SECTIONS: readonly MortgageSection[] = ['loan', 'bank', 'term'];

const LOAN_LABEL: Partial<Record<MortgageField, MessageKey>> = {
  loanAmount: 'mortgage.form.loanAmount',
  loanYears: 'mortgage.form.loanYears',
  loanRate: 'mortgage.form.loanRate',
  bankPremium: 'mortgage.form.bankPremium',
};

const TERM_LABEL = {
  Amount: { alone: 'mortgage.missing.termAmount', of: 'mortgage.missing.termAmountOf' },
  Years: { alone: 'mortgage.missing.termYears', of: 'mortgage.missing.termYearsOf' },
  Premium: { alone: 'mortgage.missing.termPremium', of: 'mortgage.missing.termPremiumOf' },
} as const satisfies Record<string, { alone: MessageKey; of: MessageKey }>;

/**
 * A missing field, as « Il manque : … » names it. In a couple, a term field says whose
 * it is, by the name typed in the form, as its section title does.
 */
export function fieldLabel(i18n: I18nService, field: MortgageField, form: Form): string {
  const loan = LOAN_LABEL[field];
  if (loan) return i18n.t(loan);
  const [, kind, n] = /^term(Amount|Years|Premium)([12])$/.exec(field)!;
  const label = TERM_LABEL[kind as keyof typeof TERM_LABEL];
  if (!form.couple) return i18n.t(label.alone);
  const id: PersonId = n === '1' ? 'p1' : 'p2';
  return i18n.t(label.of, { name: personName(i18n, form.people[id].label, id) });
}
