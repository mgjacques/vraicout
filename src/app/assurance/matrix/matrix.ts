import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { Table } from 'primeng/table';
import { formatMoney } from '../../shared/engine/formulas';
import { strategy } from '../engine/project';
import { YearRow } from '../engine/types';
import { Figure } from '../../shared/figure/figure';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ScenarioStore } from '../state/scenario.store';

/** Below this width of the section itself (not the window), a table no longer fits. */
const TABLE_MIN_WIDTH = 900;

@Component({
  selector: 'app-matrix',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccordionModule, Table, Figure],
  templateUrl: './matrix.html',
})
export class Matrix {
  readonly store = inject(ScenarioStore);
  readonly i18n = inject(I18nService);
  readonly strategy = strategy;
  private readonly width = signal(0);
  readonly wide = computed(() => this.width() >= TABLE_MIN_WIDTH);
  /** Months of the open years on narrow screens. Closed years render no figures. */
  readonly open = signal<number[]>([]);

  readonly milestoneAges = computed(
    () => new Set(this.store.projection().milestones.map((item) => item.age)),
  );
  readonly keepInvests = computed(() => this.store.projection().assumptions.keepInvests);
  readonly showExtra = computed(() => this.store.projection().assumptions.extraMonthly > 0);
  readonly keepColumns = computed(() => 3 + (this.keepInvests() ? 1 : 0));

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.width.set(host.clientWidth);
      if (typeof ResizeObserver !== 'function') return;
      const observer = new ResizeObserver((entries) =>
        this.width.set(entries[0]?.contentRect.width ?? 0),
      );
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  isMilestone(row: YearRow): boolean {
    return this.milestoneAges().has(row.age);
  }

  setOpen(value: unknown): void {
    this.open.set(
      Array.isArray(value)
        ? (value as number[])
        : value === null || value === undefined
          ? []
          : [value as number],
    );
  }

  summary(row: YearRow): { keep: string; term: string } {
    const keep = strategy(row.strategies, 'keep');
    const term = strategy(row.strategies, 'termInvest');
    return {
      keep: this.i18n.t('matrix.summaryKeep', {
        death: formatMoney(keep.forHeirs.value),
        alive: formatMoney(keep.inHand.value),
      }),
      term: this.i18n.t('matrix.summaryTerm', {
        death: formatMoney(term.forHeirs.value),
        alive: formatMoney(term.inHand.value),
      }),
    };
  }
}
