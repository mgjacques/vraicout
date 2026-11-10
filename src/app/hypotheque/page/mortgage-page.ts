import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { Drawer } from 'primeng/drawer';
import { map } from 'rxjs';
import { formatCount, formatMoney, formatPercent } from '../../shared/engine/formulas';
import { FormulaPopover } from '../../shared/figure/formula-popover';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { PageNotes } from '../../shared/page-notes/page-notes';
import { PrintButton } from '../../shared/print/print-button';
import { PrintSection, PrintService } from '../../shared/print/print.service';
import { Warning } from '../../shared/warning/warning';
import { MortgageChart } from '../mortgage-chart/mortgage-chart';
import { MortgageDifferences } from '../mortgage-differences/mortgage-differences';
import { MortgageForm } from '../mortgage-form/mortgage-form';
import { MortgagePedagogy } from '../mortgage-pedagogy/mortgage-pedagogy';
import { MortgageSummary } from '../mortgage-summary/mortgage-summary';
import { MortgageTable } from '../mortgage-table/mortgage-table';
import { MortgagePrintParams } from '../print-params/print-params';
import { MortgageStore } from '../state/mortgage.store';
import { StaleResults } from '../../shared/stale/stale-results';
import { ToolLinks } from '../../shared/tool-links/tool-links';
import { ContentsItem, PageContents } from '../../shared/page-contents/page-contents';

@Component({
  selector: 'app-mortgage-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContents,
    ToolBreadcrumb,
    ToolLinks,
    StaleResults,
    Button,
    Chip,
    Drawer,
    FormulaPopover,
    MortgageChart,
    MortgageDifferences,
    MortgageForm,
    MortgagePedagogy,
    MortgagePrintParams,
    MortgageSummary,
    MortgageTable,
    PrintButton,
    Warning,
    PageNotes,
  ],
  templateUrl: './mortgage-page.html',
})
export class MortgagePage {
  readonly i18n = inject(I18nService);
  /** The sections of the page, in order, for the contents under the header. */
  readonly contents: readonly ContentsItem[] = [
    { id: 'resultat', label: 'contents.result' },
    { id: 'graphique', label: 'contents.chart' },
    { id: 'differences', label: 'mortgage.diff.kicker' },
    { id: 'comprendre', label: 'mortgage.learn.kicker' },
    { id: 'annee-par-annee', label: 'mortgage.table.heading' },
  ];
  readonly store = inject(MortgageStore);
  readonly drawerOpen = signal(false);
  readonly collapsed = signal(false);
  readonly wide = toSignal(
    inject(BreakpointObserver)
      .observe('(min-width: 960px)')
      .pipe(map((result) => result.matches)),
    {
      initialValue:
        typeof globalThis.matchMedia === 'function' &&
        globalThis.matchMedia('(min-width: 960px)').matches,
    },
  );

  readonly chips = computed(() => {
    const { input } = this.store.projection();
    return [
      this.i18n.t('mortgage.chip.loan', {
        amount: formatMoney(input.loan.amount),
        years: formatCount(input.loan.years),
      }),
      this.i18n.t('mortgage.chip.rate', { rate: formatPercent(input.loan.rate * 100) }),
      this.i18n.t(input.couple ? 'mortgage.chip.couple' : 'mortgage.chip.single'),
      this.i18n.t('mortgage.chip.fixed'),
    ];
  });

  constructor() {
    inject(PrintService).use('hypotheque', PRINT_SECTIONS, inject(DestroyRef));
  }

  toggleSidebar(): void {
    this.collapsed.update((value) => !value);
  }
}

/** What the print dialog offers, in page order. */
const PRINT_SECTIONS: PrintSection[] = [
  { id: 'params', label: 'print.section.params' },
  { id: 'summary', label: 'mortgage.print.summary' },
  { id: 'chart', label: 'mortgage.chart.title' },
  { id: 'differences', label: 'mortgage.diff.heading' },
  { id: 'pedagogy', label: 'mortgage.learn.heading' },
  { id: 'table', label: 'mortgage.table.heading' },
];
