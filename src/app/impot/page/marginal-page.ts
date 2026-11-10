import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Message } from 'primeng/message';
import { whole } from '../../shared/engine/limits';
import { formatMoney } from '../../shared/engine/formulas';
import { Figure } from '../../shared/figure/figure';
import { FormulaPopover } from '../../shared/figure/formula-popover';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { MoneyInput } from '../../shared/money-input/money-input';
import { PageNotes } from '../../shared/page-notes/page-notes';
import { RequiredMark } from '../../shared/required-mark/required-mark';
import { ResetButton } from '../../shared/reset/reset-button';
import { RichText } from '../../shared/rich-text/rich-text';
import { StaleResults } from '../../shared/stale/stale-results';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { ToolLinks } from '../../shared/tool-links/tool-links';
import { MarginalField, MarginalForm } from '../engine/blank';
import { TAX_YEAR } from '../engine/brackets';
import { MARGINAL_LIMITS as L } from '../engine/limits';
import { RateChart } from '../rate-chart/rate-chart';
import { MarginalStore } from '../state/marginal.store';

interface Lesson {
  title: MessageKey;
  body: MessageKey;
}

@Component({
  selector: 'app-marginal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Figure,
    FormsModule,
    FormulaPopover,
    Message,
    MoneyInput,
    PageNotes,
    RateChart,
    RequiredMark,
    ResetButton,
    RichText,
    RouterLink,
    StaleResults,
    ToolBreadcrumb,
    ToolLinks,
  ],
  templateUrl: './marginal-page.html',
})
export class MarginalPage {
  readonly i18n = inject(I18nService);
  readonly store = inject(MarginalStore);
  readonly form = this.store.draft;
  readonly result = this.store.projection;
  readonly lessons = LESSONS;
  readonly limits = L;
  readonly year = TAX_YEAR;

  readonly missingLabel = computed(() =>
    this.store
      .missing()
      .map((field) => this.i18n.t(`marginal.missing.${field}` as const))
      .join(', '),
  );

  readonly extraTitle = computed(() =>
    this.i18n.t('marginal.extra.title', { amount: formatMoney(this.result().input.extra) }),
  );

  invalid(field: MarginalField): boolean {
    return this.store.missing().includes(field);
  }

  setIncome(value: number | null): void {
    this.edit((draft) => (draft.income = whole(value, L.income)));
  }

  setExtra(value: number | null): void {
    this.edit((draft) => (draft.extra = whole(value, L.extra)));
  }

  private edit(change: (draft: MarginalForm) => unknown): void {
    const draft = structuredClone(this.form());
    change(draft);
    this.store.edit(draft);
  }
}

const LESSONS: readonly Lesson[] = [
  { title: 'marginal.learn.raise.title', body: 'marginal.learn.raise.body' },
  { title: 'marginal.learn.use.title', body: 'marginal.learn.use.body' },
  { title: 'marginal.learn.limits.title', body: 'marginal.learn.limits.body' },
];
