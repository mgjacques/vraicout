import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { clampTo, Limit } from '../../shared/engine/limits';
import { FREQUENCIES, Frequency, payMax, withFrequency } from '../../shared/engine/pay';
import { Figure } from '../../shared/figure/figure';
import { FormulaPopover } from '../../shared/figure/formula-popover';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { MoneyInput } from '../../shared/money-input/money-input';
import { ResetButton } from '../../shared/reset/reset-button';
import { RichText } from '../../shared/rich-text/rich-text';
import { PageNotes } from '../../shared/page-notes/page-notes';
import { WorkField, WorkForm } from '../engine/blank';
import { HOURS_LIMITS as L } from '../engine/limits';
import { RECURRENCES, Recurrence } from '../engine/types';
import { HoursStore } from '../state/hours.store';
import { NumberInput } from '../../shared/number-input/number-input';
import { StaleResults } from '../../shared/stale/stale-results';
import { ToolLinks } from '../../shared/tool-links/tool-links';
import { RequiredMark } from '../../shared/required-mark/required-mark';

interface Lesson {
  title: MessageKey;
  body: MessageKey;
}

@Component({
  selector: 'app-hours-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ToolBreadcrumb,
    ToolLinks,
    RequiredMark,
    StaleResults,
    Figure,
    FormsModule,
    FormulaPopover,
    Message,
    MoneyInput,
    NumberInput,
    ResetButton,
    RichText,
    Select,
    PageNotes,
    RouterLink,
    ToggleSwitch,
  ],
  templateUrl: './hours-page.html',
})
export class HoursPage {
  readonly i18n = inject(I18nService);
  readonly store = inject(HoursStore);
  readonly form = this.store.draft;
  readonly result = this.store.projection;
  readonly lessons = LESSONS;
  readonly limits = L;
  readonly payMax = payMax;

  readonly frequencyOptions = computed(() =>
    FREQUENCIES.map((value) => ({ value, label: this.i18n.t(`pay.freq.${value}` as const) })),
  );

  readonly recurrenceOptions = computed(() =>
    RECURRENCES.map((value) => ({
      value,
      label: this.i18n.t(`hours.recurrence.${value}` as const),
    })),
  );

  readonly missingLabel = computed(() =>
    this.store
      .missing()
      .map((field) => this.i18n.t(`hours.missing.${field}` as const))
      .join(', '),
  );

  /** « Heures de travail chaque mois » for a monthly price, and so on. */
  readonly resultLabel = computed(
    () => `hours.result.${this.result()?.input.recurrence ?? 'once'}` as const,
  );

  readonly hoursSuffix = computed(() => this.i18n.t('unit.hours'));

  invalid(field: WorkField): boolean {
    return this.store.missing().includes(field);
  }

  setFrequency(value: Frequency): void {
    this.edit((draft) => Object.assign(draft, withFrequency(draft, value)));
  }

  setSalary(value: number | null): void {
    this.edit((draft) => (draft.salary = cents(value, { min: 0, max: payMax(draft.frequency) })));
  }

  setHoursPerWeek(value: number | null): void {
    this.edit(
      (draft) => (draft.hoursPerWeek = value === null ? null : clampTo(value, L.hoursPerWeek)),
    );
  }

  setWorkCosts(value: number | null): void {
    this.edit((draft) => (draft.workCosts = cents(value, L.workCosts)));
  }

  setPrice(value: number | null): void {
    this.edit((draft) => (draft.price = cents(value, L.price)));
  }

  setRecurrence(value: Recurrence): void {
    this.edit((draft) => (draft.recurrence = value));
  }

  setAddTax(value: boolean): void {
    this.edit((draft) => (draft.addTax = value));
  }

  private edit(change: (draft: WorkForm) => unknown): void {
    const draft = structuredClone(this.form());
    change(draft);
    this.store.edit(draft);
  }
}

const LESSONS: readonly Lesson[] = [
  { title: 'hours.learn.net.title', body: 'hours.learn.net.body' },
  { title: 'hours.learn.costs.title', body: 'hours.learn.costs.body' },
  { title: 'hours.learn.limits.title', body: 'hours.learn.limits.body' },
];

function cents(value: number | null, limit: Limit): number | null {
  return value === null ? null : clampTo(Math.round(value * 100) / 100, limit);
}
