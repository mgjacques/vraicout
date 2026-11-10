import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Message } from 'primeng/message';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { cents, fromPercent, toPercent, whole } from '../../shared/engine/limits';
import { Figure } from '../../shared/figure/figure';
import { FormulaPopover } from '../../shared/figure/formula-popover';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { MoneyInput } from '../../shared/money-input/money-input';
import { NumberInput } from '../../shared/number-input/number-input';
import { PageNotes } from '../../shared/page-notes/page-notes';
import { RequiredMark } from '../../shared/required-mark/required-mark';
import { ResetButton } from '../../shared/reset/reset-button';
import { RichText } from '../../shared/rich-text/rich-text';
import { StaleResults } from '../../shared/stale/stale-results';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { ToolLinks } from '../../shared/tool-links/tool-links';
import { Warning } from '../../shared/warning/warning';
import { SavingsField, SavingsForm } from '../engine/blank';
import { SAVINGS_LIMITS as L } from '../engine/limits';
import { SavingsChart } from '../savings-chart/savings-chart';
import { SavingsStore } from '../state/savings.store';

interface Lesson {
  title: MessageKey;
  body: MessageKey;
}

@Component({
  selector: 'app-savings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Figure,
    FormsModule,
    FormulaPopover,
    Message,
    MoneyInput,
    NumberInput,
    PageNotes,
    RequiredMark,
    ResetButton,
    RichText,
    RouterLink,
    SavingsChart,
    StaleResults,
    ToggleSwitch,
    ToolBreadcrumb,
    ToolLinks,
    Warning,
  ],
  templateUrl: './savings-page.html',
})
export class SavingsPage {
  readonly i18n = inject(I18nService);
  readonly store = inject(SavingsStore);
  readonly form = this.store.draft;
  readonly result = this.store.projection;
  readonly lessons = LESSONS;
  readonly limits = L;

  readonly years = computed(() => this.i18n.t('unit.years'));
  readonly percent = computed(() => this.i18n.t('unit.percent'));
  readonly returnPercent = computed(() => toPercent(this.form().annualReturn));
  readonly inflationPercent = computed(() => toPercent(this.form().inflation));

  readonly missingLabel = computed(() =>
    this.store
      .missing()
      .map((field) => this.i18n.t(`savings.missing.${field}` as const))
      .join(', '),
  );

  invalid(field: SavingsField): boolean {
    return this.store.missing().includes(field);
  }

  setInitial(value: number | null): void {
    this.edit((draft) => (draft.initial = cents(value, L.initialAmount)));
  }

  setMonthly(value: number | null): void {
    this.edit((draft) => (draft.monthly = cents(value, L.monthlyDeposit)));
  }

  setDepositYears(value: number | null): void {
    this.edit((draft) => (draft.depositYears = whole(value, L.depositYears)));
  }

  setGrowthYears(value: number | null): void {
    this.edit((draft) => (draft.growthYears = whole(value, L.growthYears)));
  }

  setReturn(value: number | null): void {
    this.edit((draft) => (draft.annualReturn = fromPercent(value, L.returnPercent)));
  }

  setDelay(value: number | null): void {
    this.edit((draft) => (draft.delayYears = whole(value, L.delayYears)));
  }

  setRealDollars(value: boolean): void {
    this.edit((draft) => (draft.realDollars = value));
  }

  setInflation(value: number | null): void {
    this.edit((draft) => (draft.inflation = fromPercent(value, L.inflationPercent) ?? 0));
  }

  private edit(change: (draft: SavingsForm) => unknown): void {
    const draft = structuredClone(this.form());
    change(draft);
    this.store.edit(draft);
  }
}

const LESSONS: readonly Lesson[] = [
  { title: 'savings.learn.compound.title', body: 'savings.learn.compound.body' },
  { title: 'savings.learn.early.title', body: 'savings.learn.early.body' },
  { title: 'savings.learn.limits.title', body: 'savings.learn.limits.body' },
];
