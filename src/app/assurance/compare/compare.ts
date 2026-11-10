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
import { Message } from 'primeng/message';
import { map } from 'rxjs';
import { ChartPanel } from '../charts/chart-panel';
import { Drawer as ParamsForm } from '../drawer/drawer';
import { formatAge, formatPercent } from '../../shared/engine/formulas';
import { Account } from '../engine/types';
import { MessageKey } from '../../shared/i18n/fr';
import { FormulaPopover } from '../../shared/figure/formula-popover';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolBreadcrumb } from '../../shared/tool-breadcrumb/tool-breadcrumb';
import { PageNotes } from '../../shared/page-notes/page-notes';
import { PrintButton } from '../../shared/print/print-button';
import { PrintSection, PrintService } from '../../shared/print/print.service';
import { PrintParams } from '../print-params/print-params';
import { Matrix } from '../matrix/matrix';
import { MilestoneCards } from '../milestones/milestone-cards';
import { Narratives } from '../narratives/narratives';
import { Pedagogy } from '../pedagogy/pedagogy';
import { ScenarioStore } from '../state/scenario.store';
import { Warning } from '../../shared/warning/warning';
import { StaleResults } from '../../shared/stale/stale-results';
import { ToolLinks } from '../../shared/tool-links/tool-links';
import { ContentsItem, PageContents } from '../../shared/page-contents/page-contents';

@Component({
  selector: 'app-compare',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageContents,
    ToolBreadcrumb,
    ToolLinks,
    StaleResults,
    Button,
    Chip,
    Drawer,
    Message,
    ChartPanel,
    FormulaPopover,
    PrintButton,
    PrintParams,
    ParamsForm,
    Matrix,
    MilestoneCards,
    Narratives,
    Pedagogy,
    Warning,
    PageNotes,
  ],
  templateUrl: './compare.html',
})
export class Compare {
  readonly i18n = inject(I18nService);
  /** The sections of the page, in order, for the contents under the header. */
  readonly contents: readonly ContentsItem[] = [
    { id: 'a-un-age', label: 'section.compare' },
    { id: 'evolution', label: 'section.charts' },
    { id: 'avantages', label: 'section.narrative' },
    { id: 'comprendre', label: 'section.learn' },
    { id: 'annee-par-annee', label: 'matrix.heading' },
  ];
  readonly store = inject(ScenarioStore);
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
    const projection = this.store.projection();
    return {
      termEnd: this.i18n.t('chip.termEnd', { age: formatAge(projection.termEndAge) }),
      paidUp:
        projection.assumptions.premiumMonths > 0
          ? this.i18n.t('chip.paidUp', { age: formatAge(projection.paidUpAge) })
          : this.i18n.t('chip.paidUpDone'),
      horizon: this.i18n.t('chip.horizon', { age: formatAge(projection.horizonAge) }),
      rate: this.i18n.t('chip.return', {
        rate: formatPercent(projection.assumptions.annualReturn * 100),
      }),
      account: this.i18n.t(ACCOUNT_CHIP[projection.assumptions.account], {
        rate: formatPercent(projection.assumptions.taxRate * 100),
      }),
      dollars: projection.assumptions.realDollars
        ? this.i18n.t('chip.real', { rate: formatPercent(projection.assumptions.inflation * 100) })
        : this.i18n.t('chip.nominal'),
      reinvest: this.i18n.t('chip.reinvest', {
        share: formatPercent(projection.assumptions.reinvestShare * 100),
      }),
    };
  });

  constructor() {
    inject(PrintService).use('assurance', PRINT_SECTIONS, inject(DestroyRef));
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
  { id: 'milestones', label: 'section.compare' },
  { id: 'chart-death', label: 'chart.deathTitle' },
  { id: 'chart-alive', label: 'chart.aliveTitle' },
  { id: 'narratives', label: 'section.narrative' },
  { id: 'pedagogy', label: 'section.learn' },
  { id: 'matrix', label: 'section.matrix' },
];
