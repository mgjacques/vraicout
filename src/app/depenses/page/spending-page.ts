import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { formatCount, formatPercent } from '../../shared/engine/formulas';
import { clampTo, Limit } from '../../shared/engine/limits';
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
import { SpendingField, SpendingForm } from '../engine/blank';
import { SPENDING_LIMITS as L } from '../engine/limits';
import { Cadence, CADENCES } from '../engine/types';
import { SpendingStore } from '../state/spending.store';

interface Lesson {
  title: MessageKey;
  body: MessageKey;
}

@Component({
  selector: 'app-spending-page',
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
    Select,
    StaleResults,
    ToggleSwitch,
    ToolBreadcrumb,
    ToolLinks,
    Warning,
  ],
  templateUrl: './spending-page.html',
})
export class SpendingPage {
  readonly i18n = inject(I18nService);
  readonly store = inject(SpendingStore);
  readonly form = this.store.draft;
  readonly result = this.store.projection;
  readonly lessons = LESSONS;
  readonly limits = L;

  readonly years = computed(() => this.i18n.t('unit.years'));
  readonly percent = computed(() => this.i18n.t('unit.percent'));
  readonly returnPercent = computed(() => toPercent(this.form().annualReturn));
  readonly inflationPercent = computed(() => toPercent(this.form().inflation));

  readonly cadenceOptions = computed(() =>
    CADENCES.map((value) => ({
      value,
      label: this.i18n.t(`spending.cadence.${value}` as const),
    })),
  );

  readonly timesPerYear = computed(() =>
    this.i18n.t('spending.form.timesPerYear', { times: formatCount(this.result().timesPerYear) }),
  );

  readonly opportunityHelp = computed(() => {
    const input = this.result().input;
    return this.i18n.t('spending.result.opportunityHelp', {
      years: input.years,
      rate: formatPercent(input.annualReturn * 100),
    });
  });

  readonly missingLabel = computed(() =>
    this.store
      .missing()
      .map((field) => this.i18n.t(`spending.missing.${field}` as const))
      .join(', '),
  );

  invalid(field: SpendingField): boolean {
    return this.store.missing().includes(field);
  }

  setAmount(value: number | null): void {
    this.edit((draft) => (draft.amount = cents(value, L.amount)));
  }

  setCount(value: number | null): void {
    this.edit((draft) => (draft.count = whole(value, L.count)));
  }

  setCadence(value: Cadence): void {
    this.edit((draft) => (draft.cadence = value));
  }

  setYears(value: number | null): void {
    this.edit((draft) => (draft.years = whole(value, L.years)));
  }

  setReturn(value: number | null): void {
    this.edit((draft) => (draft.annualReturn = fromPercent(value, L.returnPercent)));
  }

  setPriceGrowth(value: boolean): void {
    this.edit((draft) => (draft.priceGrowth = value));
  }

  setInflation(value: number | null): void {
    this.edit((draft) => (draft.inflation = fromPercent(value, L.inflationPercent) ?? 0));
  }

  private edit(change: (draft: SpendingForm) => unknown): void {
    const draft = structuredClone(this.form());
    change(draft);
    this.store.edit(draft);
  }
}

const LESSONS: readonly Lesson[] = [
  { title: 'spending.learn.opportunity.title', body: 'spending.learn.opportunity.body' },
  { title: 'spending.learn.limits.title', body: 'spending.learn.limits.body' },
];

function toPercent(value: number | null): number | null {
  return value === null ? null : Math.round(value * 10_000) / 100;
}

function fromPercent(value: number | null, limit: Limit): number | null {
  return value === null ? null : Math.round(clampTo(value, limit) * 100) / 10_000;
}

function cents(value: number | null, limit: Limit): number | null {
  return value === null ? null : clampTo(Math.round(value * 100) / 100, limit);
}

function whole(value: number | null, limit: Limit): number | null {
  return value === null ? null : clampTo(Math.round(value), limit);
}
