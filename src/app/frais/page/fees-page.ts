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
import { formatCount, formatPercent } from '../../shared/engine/formulas';
import { Account } from '../../shared/engine/money';
import { FormulaPopover } from '../../shared/figure/formula-popover';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { PageNotes } from '../../shared/page-notes/page-notes';
import { PrintButton } from '../../shared/print/print-button';
import { PrintSection, PrintService } from '../../shared/print/print.service';
import { FeesPrintParams } from '../print-params/print-params';
import { Warning } from '../../shared/warning/warning';
import { FeesChart } from '../fees-chart/fees-chart';
import { FeesForm } from '../fees-form/fees-form';
import { FeesPedagogy } from '../fees-pedagogy/fees-pedagogy';
import { FeesSummary } from '../fees-summary/fees-summary';
import { FeesTable } from '../fees-table/fees-table';
import { FeesStore } from '../state/fees.store';
import { StaleResults } from '../../shared/stale/stale-results';
import { ToolLinks } from '../../shared/tool-links/tool-links';
import { ContentsItem, PageContents } from '../../shared/page-contents/page-contents';

@Component({
  selector: 'app-fees-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContents,
    ToolBreadcrumb,
    ToolLinks,
    StaleResults,
    Button,
    Chip,
    Drawer,
    FeesChart,
    FeesForm,
    FeesPedagogy,
    FeesSummary,
    FeesTable,
    FormulaPopover,
    PrintButton,
    FeesPrintParams,
    Warning,
    PageNotes,
  ],
  templateUrl: './fees-page.html',
})
export class FeesPage {
  readonly i18n = inject(I18nService);
  /** The sections of the page, in order, for the contents under the header. */
  readonly contents: readonly ContentsItem[] = [
    { id: 'resultat', label: 'contents.result' },
    { id: 'graphique', label: 'contents.chart' },
    { id: 'comprendre', label: 'fees.learn.kicker' },
    { id: 'annee-par-annee', label: 'fees.table.heading' },
  ];
  readonly store = inject(FeesStore);
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
      this.i18n.t('fees.chip.years', { years: formatCount(input.years) }),
      this.i18n.t('fees.chip.return', { rate: formatPercent(input.grossReturn * 100) }),
      this.i18n.t(ACCOUNT_CHIP[input.account], { rate: formatPercent(input.taxRate * 100) }),
      input.realDollars
        ? this.i18n.t('chip.real', { rate: formatPercent(input.inflation * 100) })
        : this.i18n.t('chip.nominal'),
    ];
  });

  constructor() {
    inject(PrintService).use('frais', PRINT_SECTIONS, inject(DestroyRef));
  }

  toggleSidebar(): void {
    this.collapsed.update((value) => !value);
  }
}

const ACCOUNT_CHIP: Record<Account, MessageKey> = {
  tfsa: 'chip.account.tfsa',
  rrsp: 'chip.account.rrsp',
  taxable: 'chip.account.taxable',
};

/** What the print dialog offers, in page order. */
const PRINT_SECTIONS: PrintSection[] = [
  { id: 'params', label: 'print.section.params' },
  { id: 'summary', label: 'fees.print.summary' },
  { id: 'chart', label: 'fees.chart.title' },
  { id: 'pedagogy', label: 'fees.learn.heading' },
  { id: 'table', label: 'fees.table.heading' },
];
