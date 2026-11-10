import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { formatMoney, formatPercent } from '../../shared/engine/formulas';
import { Figure } from '../../shared/figure/figure';
import { FormulaPopover } from '../../shared/figure/formula-popover';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { PageNotes } from '../../shared/page-notes/page-notes';
import { MoneyInput } from '../../shared/money-input/money-input';
import { RichText } from '../../shared/rich-text/rich-text';
import { ResetButton } from '../../shared/reset/reset-button';
import { SplitField, SplitForm } from '../engine/blank';
import { SPLIT_LIMITS as L } from '../engine/limits';
import { clampTo, Limit } from '../../shared/engine/limits';
import { FREQUENCIES, Frequency, payMax, withFrequency } from '../../shared/engine/pay';
import { PersonId } from '../engine/types';
import { SplitStore } from '../state/split.store';
import { StaleResults } from '../../shared/stale/stale-results';
import { ToolLinks } from '../../shared/tool-links/tool-links';
import { RequiredMark } from '../../shared/required-mark/required-mark';

interface Lesson {
  title: MessageKey;
  body: MessageKey;
}

@Component({
  selector: 'app-split-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ToolBreadcrumb,
    ToolLinks,
    RequiredMark,
    StaleResults,
    RichText,
    Figure,
    FormsModule,
    FormulaPopover,
    MoneyInput,
    InputText,
    Message,
    ResetButton,
    Select,
    PageNotes,
    RouterLink,
  ],
  templateUrl: './split-page.html',
})
export class SplitPage {
  readonly i18n = inject(I18nService);
  readonly store = inject(SplitStore);
  readonly form = this.store.draft;
  readonly result = this.store.projection;
  readonly people: readonly PersonId[] = ['p1', 'p2'];
  readonly basisLessons = BASIS_LESSONS;
  readonly lessons = LESSONS;
  readonly limits = L;
  readonly payMax = payMax;

  readonly frequencyOptions = computed(() =>
    FREQUENCIES.map((value) => ({ value, label: this.i18n.t(`pay.freq.${value}` as const) })),
  );

  readonly missingLabel = computed(() =>
    this.store
      .missing()
      .map((field) => this.i18n.t('split.missing.salary', { name: this.name(person(field)) }))
      .join(', '),
  );

  readonly billText = computed(() => {
    const bill = this.result()?.input.bill ?? null;
    return bill === null ? '' : this.i18n.t('split.result.bill', { bill: formatMoney(bill) });
  });

  /** The name typed, or "Personne 1" / "Personne 2" until one is. */
  name(id: PersonId): string {
    return this.form().people[id].label.trim() || this.i18n.t(`split.person.${id}` as const);
  }

  /** A share to one decimal, as in « 57,7 % ». */
  percent(share: number): string {
    return formatPercent(Math.round(share * 10) / 10);
  }

  invalid(id: PersonId): boolean {
    return this.store.missing().includes(id === 'p1' ? 'salary1' : 'salary2');
  }

  setLabel(id: PersonId, value: string): void {
    this.edit((draft) => (draft.people[id].label = value));
  }

  setFrequency(id: PersonId, value: Frequency): void {
    this.edit((draft) => (draft.people[id] = withFrequency(draft.people[id], value)));
  }

  setSalary(id: PersonId, value: number | null): void {
    this.edit((draft) => {
      const pay = { min: 0, max: payMax(draft.people[id].frequency) };
      draft.people[id].salary = cents(value, pay);
    });
  }

  setBill(value: number | null): void {
    this.edit((draft) => (draft.bill = cents(value, L.bill)));
  }

  private edit(change: (draft: SplitForm) => unknown): void {
    const draft = structuredClone(this.form());
    change(draft);
    this.store.edit(draft);
  }
}

const BASIS_LESSONS: readonly Lesson[] = [
  { title: 'split.basis.gross.title', body: 'split.basis.gross.body' },
  { title: 'split.basis.net.title', body: 'split.basis.net.body' },
  { title: 'split.basis.which.title', body: 'split.basis.which.body' },
];

const LESSONS: readonly Lesson[] = [
  { title: 'split.learn.why.title', body: 'split.learn.why.body' },
  { title: 'split.learn.frequency.title', body: 'split.learn.frequency.body' },
  { title: 'split.learn.other.title', body: 'split.learn.other.body' },
];

function person(field: SplitField): PersonId {
  return field === 'salary1' ? 'p1' : 'p2';
}

function cents(value: number | null, limit: Limit): number | null {
  return value === null ? null : clampTo(Math.round(value * 100) / 100, limit);
}
