import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Chart, ChartOptions } from 'chart.js';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import { UIChart } from 'primeng/chart';
import { map } from 'rxjs';
import { crosshairPlugin, cssColor, formatAxis } from '../../shared/charts/chart-style';
import { formatAge, formatMoney } from '../../shared/engine/formulas';
import { strategy } from '../engine/project';
import { ChartSeries, SeriesId, StrategySnapshot } from '../engine/types';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ThemeService } from '../../shared/theme/theme.service';
import { ScenarioStore } from '../state/scenario.store';

@Component({
  selector: 'app-chart-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UIChart],
  templateUrl: './chart-panel.html',
})
export class ChartPanel {
  readonly mode = input.required<'death' | 'alive'>();
  private readonly store = inject(ScenarioStore);
  /** Colours come from CSS variables; reading this recomputes the chart when the theme flips. */
  private readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly plugins = [crosshairPlugin];
  /** Line-end labels need room; on a phone the legend and the tooltip carry identity. */
  private readonly roomy = toSignal(
    inject(BreakpointObserver)
      .observe('(min-width: 640px)')
      .pipe(map((result) => result.matches)),
    {
      initialValue:
        typeof globalThis.matchMedia === 'function' &&
        globalThis.matchMedia('(min-width: 640px)').matches,
    },
  );

  readonly title = computed(() =>
    this.i18n.t(this.mode() === 'death' ? 'chart.deathTitle' : 'chart.aliveTitle'),
  );
  readonly subtitle = computed(() =>
    this.i18n.t(this.mode() === 'death' ? 'chart.deathSub' : 'chart.aliveSub'),
  );
  readonly aria = computed(() =>
    this.i18n.t(this.mode() === 'death' ? 'chart.ariaDeath' : 'chart.ariaAlive'),
  );

  readonly data = computed(() => {
    this.theme.dark();
    const projection = this.store.projection();
    const rows = projection.series.filter((series) => series.chart === this.mode());
    return {
      datasets: rows.map((series) => {
        const color = cssColor(COLOR_VAR[series.id], COLOR_FALLBACK[series.id]);
        return {
          label: this.i18n.t(SERIES_KEY[series.id]),
          data: series.points.map((point) => ({ x: point.age, y: point.value })),
          borderColor: color,
          backgroundColor: color,
          borderDash: series.dashed ? DASH : undefined,
          borderWidth: 2,
          borderCapStyle: 'round' as const,
          borderJoinStyle: 'round' as const,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: cssColor('--surface', '#fffdf8'),
          spanGaps: false,
          tension: 0,
        };
      }),
    };
  });

  readonly options = computed<ChartOptions>(() => {
    this.theme.dark();
    const projection = this.store.projection();
    const ink = cssColor('--ink', '#1c2421');
    const muted = cssColor('--muted', '#5c675f');
    const line = cssColor('--line', '#e2dbd0');
    const rows = projection.series.filter((series) => series.chart === this.mode());
    const max = axisMax(rows);
    const ends = this.roomy() ? endLabels(rows, max) : [];
    const lastAge = projection.years.at(-1)?.age ?? projection.horizonAge;
    // Each point's snapshot, by month, for the parts shown under a total.
    const byMonth = new Map(
      [...projection.years, ...(projection.beforeTermEnd ? [projection.beforeTermEnd] : [])].map(
        (row) => [row.month, row.strategies],
      ),
    );
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { right: ends.length ? 170 : 0 } },
      plugins: {
        legend: {
          position: 'bottom',
          // A short line, dashes included: the legend tells a variant from its total.
          labels: {
            color: ink,
            usePointStyle: true,
            pointStyle: 'line',
            pointStyleWidth: 24,
            padding: this.roomy() ? 14 : 8,
            // A point style draws without the dataset's dashes; put them back.
            generateLabels: (chart) =>
              Chart.defaults.plugins.legend.labels.generateLabels(chart).map((item) => ({
                ...item,
                lineDash: rows[item.datasetIndex ?? 0]?.dashed ? DASH : [],
              })),
          },
        },
        tooltip: {
          usePointStyle: true,
          itemSort: (left, right) => (right.parsed.y ?? 0) - (left.parsed.y ?? 0),
          callbacks: {
            title: (items) => {
              const age = items[0]?.parsed.x ?? 0;
              return age === projection.beforeTermEnd?.age
                ? this.i18n.t('chart.tooltipBeforeEnd', { age: formatAge(projection.termEndAge) })
                : this.i18n.t('chart.tooltipAge', { age: formatAge(age) });
            },
            // The value leads; the series name follows.
            label: (context) => {
              const raw = context.parsed.y;
              if (raw === null || Number.isNaN(raw)) return '';
              return `${formatMoney(raw)}  ${context.dataset.label ?? ''}`;
            },
            // What the total is made of, when invested money is part of it.
            afterLabel: (context) => {
              const series = rows[context.datasetIndex];
              const month = series?.points[context.dataIndex]?.month;
              const strategies = month === undefined ? undefined : byMonth.get(month);
              if (!series || !strategies) return '';
              const parts = PARTS[series.id]?.(strategies);
              if (!parts || parts.savings <= 0) return '';
              return this.i18n.t(parts.key, {
                amount: formatMoney(parts.amount),
                savings: formatMoney(parts.savings),
              });
            },
            labelPointStyle: () => ({ pointStyle: 'line', rotation: 0 }),
          },
        },
        annotation: {
          clip: false,
          annotations: {
            ...this.endAnnotations(ends, lastAge),
            // The age read in the table above: one solid hairline on both charts.
            focus: {
              type: 'line',
              scaleID: 'x',
              value: this.store.focus().age,
              borderColor: ink,
              borderWidth: 1,
              label: {
                display: true,
                content: this.i18n.t('chart.tooltipAge', {
                  age: formatAge(this.store.focus().age),
                }),
                position: 'end',
                backgroundColor: cssColor('--surface', '#fffdf8'),
                color: ink,
                font: { size: 11, weight: 'bold' },
              },
            },
            cliff: {
              type: 'line',
              scaleID: 'x',
              value: projection.termEndAge,
              borderColor: muted,
              borderDash: [4, 4],
              borderWidth: 1,
              label: {
                display: true,
                content: this.i18n.t('chart.cliff'),
                position: 'start',
                backgroundColor: 'transparent',
                color: muted,
                font: { size: 11, weight: 'bold' },
                callout: { display: false },
              },
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          min: projection.currentAge,
          max: lastAge,
          ticks: {
            color: muted,
            maxRotation: 0,
            precision: 0,
            callback: (value) => formatAge(Number(value)),
          },
          grid: { color: line },
          border: { color: line },
        },
        y: {
          beginAtZero: true,
          suggestedMax: max,
          ticks: {
            color: muted,
            callback: (value) => formatAxis(Number(value)),
          },
          grid: { color: line },
          border: { color: line },
        },
      },
    };
  });

  /** A dot and a short label at the end of each line that has room; text stays in ink. */
  private endAnnotations(
    ends: readonly ChartSeries[],
    lastAge: number,
  ): Record<string, AnnotationOptions> {
    const ink = cssColor('--ink', '#1c2421');
    const surface = cssColor('--surface', '#fffdf8');
    const out: Record<string, AnnotationOptions> = {};
    for (const series of ends) {
      const value = series.points.at(-1)?.value ?? 0;
      out[`dot-${series.id}`] = {
        type: 'point',
        xValue: lastAge,
        yValue: value,
        radius: 4,
        backgroundColor: cssColor(COLOR_VAR[series.id], COLOR_FALLBACK[series.id]),
        borderColor: surface,
        borderWidth: 2,
      };
      out[`label-${series.id}`] = {
        type: 'label',
        xValue: lastAge,
        yValue: value,
        position: { x: 'start', y: 'center' },
        xAdjust: 10,
        content: [formatMoney(value), this.i18n.t(SHORT_KEY[series.id])],
        color: ink,
        font: { size: 12, weight: 600 },
        textAlign: 'left',
      };
    }
    return out;
  }
}

/** Dashes of a variant line, on the chart and in the legend. */
const DASH = [6, 4];

/** Share of the y-axis a two-line end label needs; a closer label would collide and is left to the legend. */
const END_LABEL_GAP = 0.15;

/** The series whose end value leaves room for a label, highest first; at most four. */
function endLabels(series: readonly ChartSeries[], max: number): ChartSeries[] {
  const byEnd = [...series]
    .filter((item) => item.points.at(-1)?.value !== null && item.points.at(-1)?.value !== undefined)
    .sort((left, right) => (right.points.at(-1)!.value ?? 0) - (left.points.at(-1)!.value ?? 0));
  const kept: ChartSeries[] = [];
  let lastValue = Infinity;
  for (const item of byEnd) {
    const value = item.points.at(-1)!.value ?? 0;
    if (lastValue - value < max * END_LABEL_GAP) continue;
    kept.push(item);
    lastValue = value;
    if (kept.length === 4) break;
  }
  return kept;
}

const SHORT_KEY: Record<SeriesId, MessageKey> = {
  keepHeirs: 'series.short.keepHeirs',
  keepHeirsProjected: 'series.short.keepHeirsProjected',
  termHeirs: 'series.short.termHeirs',
  keepInHand: 'series.short.keepInHand',
  keepInHandGuaranteed: 'series.short.keepInHandGuaranteed',
  extra: 'series.short.extra',
  termInHand: 'series.short.termInHand',
};

const SERIES_KEY: Record<SeriesId, MessageKey> = {
  keepHeirs: 'series.keepHeirs',
  keepHeirsProjected: 'series.keepHeirsProjected',
  termHeirs: 'series.termHeirs',
  keepInHand: 'series.keepInHand',
  keepInHandGuaranteed: 'series.keepInHandGuaranteed',
  extra: 'series.extra',
  termInHand: 'series.termInHand',
};

const COLOR_VAR: Record<SeriesId, string> = {
  keepHeirs: '--keep',
  keepHeirsProjected: '--keep',
  termHeirs: '--term-series',
  keepInHand: '--keep',
  keepInHandGuaranteed: '--keep',
  extra: '--extra',
  termInHand: '--term-series',
};

const COLOR_FALLBACK: Record<SeriesId, string> = {
  keepHeirs: '#9a3412',
  keepHeirsProjected: '#9a3412',
  termHeirs: '#00846f',
  keepInHand: '#9a3412',
  keepInHandGuaranteed: '#9a3412',
  extra: '#3f4542',
  termInHand: '#00846f',
};

interface Parts {
  key: MessageKey;
  amount: number;
  savings: number;
}

/** The two amounts behind each total, read from the snapshot the total was built from. */
const PARTS: Partial<Record<SeriesId, (strategies: StrategySnapshot[]) => Parts | null>> = {
  keepHeirs: (items) => {
    const keep = strategy(items, 'keep');
    return {
      key: 'chart.parts.insurance',
      amount: keep.deathBenefit.value,
      savings: keep.gapSavings?.value ?? 0,
    };
  },
  keepHeirsProjected: (items) => {
    const keep = strategy(items, 'keep');
    if (!keep.deathBenefitProjected) return null;
    return {
      key: 'chart.parts.insurance',
      amount: keep.deathBenefitProjected.value,
      savings: keep.gapSavings?.value ?? 0,
    };
  },
  termHeirs: (items) => {
    const term = strategy(items, 'termInvest');
    return {
      key: 'chart.parts.insurance',
      amount: term.deathBenefit.value,
      savings: term.alive.value,
    };
  },
  keepInHand: (items) => {
    const keep = strategy(items, 'keep');
    return {
      key: 'chart.parts.cash',
      amount: keep.alive.value,
      savings: keep.gapSavings?.value ?? 0,
    };
  },
  keepInHandGuaranteed: (items) => {
    const keep = strategy(items, 'keep');
    if (!keep.aliveGuaranteed) return null;
    return {
      key: 'chart.parts.cash',
      amount: keep.aliveGuaranteed.value,
      savings: keep.gapSavings?.value ?? 0,
    };
  },
};

function axisMax(series: ChartSeries[]): number {
  let max = 0;
  for (const item of series) {
    for (const point of item.points) {
      if (point.value !== null) max = Math.max(max, point.value);
    }
  }
  if (max <= 0) return 1;
  const padded = max * 1.12;
  const step = padded >= 100000 ? 50000 : padded >= 10000 ? 5000 : 1000;
  return Math.ceil(padded / step) * step;
}
