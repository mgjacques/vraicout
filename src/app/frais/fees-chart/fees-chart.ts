import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChartOptions } from 'chart.js';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import { UIChart } from 'primeng/chart';
import { map } from 'rxjs';
import { crosshairPlugin, cssColor, formatAxis, hexAlpha } from '../../shared/charts/chart-style';
import { formatMoney } from '../../shared/engine/formulas';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ThemeService } from '../../shared/theme/theme.service';
import { PortfolioId } from '../engine/types';
import { FeesStore } from '../state/fees.store';

/** Share of the y-axis two retirement labels need between them; closer, they would collide. */
const LABEL_GAP = 0.2;

@Component({
  selector: 'app-fees-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UIChart],
  templateUrl: './fees-chart.html',
})
export class FeesChart {
  private readonly store = inject(FeesStore);
  /** Colours come from CSS variables; reading this recomputes the chart when the theme flips. */
  private readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly plugins = [crosshairPlugin];
  /** Direct labels need room; on a phone the legend, the tooltip and the cards above carry them. */
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

  readonly subtitle = computed(() =>
    this.i18n.t(
      this.store.projection().drawdownMonths > 0 ? 'fees.chart.subDrawdown' : 'fees.chart.sub',
    ),
  );

  private readonly endLabels = computed(
    () => this.roomy() && this.store.projection().drawdownMonths === 0,
  );

  private readonly names = computed(() => {
    const { portfolios } = this.store.projection();
    const name = (id: PortfolioId) =>
      portfolios[id].label.trim() ||
      this.i18n.t(id === 'a' ? 'fees.form.portfolioA' : 'fees.form.portfolioB');
    return { a: name('a'), b: name('b') };
  });

  readonly data = computed(() => {
    this.theme.dark();
    const { rows } = this.store.projection();
    const names = this.names();
    const series = [
      { key: 'a' as const, label: names.a, color: cssColor('--fee-a', '#9a3412'), dashed: false },
      { key: 'b' as const, label: names.b, color: cssColor('--fee-b', '#00846f'), dashed: false },
      {
        key: 'none' as const,
        label: this.i18n.t('fees.chart.none'),
        color: cssColor('--muted', '#5c675f'),
        dashed: true,
      },
    ];
    return {
      labels: rows.map((row) => String(row.year)),
      datasets: series.map((item) => ({
        label: item.label,
        data: rows.map((row) => row.balance[item.key]),
        borderColor: item.color,
        backgroundColor: item.color,
        borderDash: item.dashed ? [6, 4] : undefined,
        borderWidth: 2,
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: cssColor('--surface', '#fffdf8'),
        tension: 0,
      })),
    };
  });

  readonly options = computed<ChartOptions>(() => {
    this.theme.dark();
    const ink = cssColor('--ink', '#1c2421');
    const muted = cssColor('--muted', '#5c675f');
    const line = cssColor('--line', '#e2dbd0');
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      // Room for the line-end labels when retirement is the last point.
      layout: { padding: { right: this.endLabels() ? 120 : 0 } },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: ink, boxWidth: 18, boxHeight: 2, padding: 14 },
        },
        tooltip: {
          usePointStyle: true,
          itemSort: (left, right) => (right.parsed.y ?? 0) - (left.parsed.y ?? 0),
          callbacks: {
            title: (items) => this.i18n.t('fees.chart.year', { year: items[0]?.label ?? '' }),
            // The value leads; the series name follows.
            label: (context) =>
              `${formatMoney(context.parsed.y ?? 0)}  ${context.dataset.label ?? ''}`,
            labelPointStyle: () => ({ pointStyle: 'line', rotation: 0 }),
          },
        },
        annotation: { clip: false, annotations: this.annotations() },
      },
      scales: {
        x: {
          title: { display: true, text: this.i18n.t('fees.chart.axis'), color: muted },
          ticks: { color: muted, maxRotation: 0, autoSkip: true },
          grid: { color: line },
          border: { color: line },
        },
        y: {
          beginAtZero: true,
          ticks: { color: muted, callback: (value) => formatAxis(Number(value)) },
          grid: { color: line },
          border: { color: line },
        },
      },
    };
  });

  /**
   * The retirement line, and a direct label on each portfolio where it peaks.
   * While the portfolios are spent, labels sit below and right of their point, where the
   * space under each falling curve is empty. When retirement is the last point, they sit at
   * the line ends, in a right margin outside the plot. The upper one is dropped when the
   * two values are too close to keep it clear.
   */
  private annotations(): Record<string, AnnotationOptions> {
    const projection = this.store.projection();
    const ink = cssColor('--ink', '#1c2421');
    const muted = cssColor('--muted', '#5c675f');
    const surface = cssColor('--surface', '#fffdf8');
    const x = String(projection.input.years);
    const out: Record<string, AnnotationOptions> = {};
    if (projection.drawdownMonths > 0) {
      out['retirement'] = {
        type: 'line',
        scaleID: 'x',
        value: x,
        borderColor: muted,
        borderDash: [4, 4],
        borderWidth: 1,
        label: {
          display: true,
          content: this.i18n.t('fees.chart.retirement'),
          position: 'start',
          backgroundColor: 'transparent',
          color: muted,
          font: { size: 11, weight: 'bold' },
        },
      };
    }

    const row = projection.rows.find((item) => item.month === projection.savingMonths);
    if (!row || !this.roomy()) return out;
    const top = Math.max(row.balance.none, row.balance.a, row.balance.b);
    const ids: PortfolioId[] = row.balance.a >= row.balance.b ? ['a', 'b'] : ['b', 'a'];
    const [upper, lower] = ids;
    const clear = row.balance[upper] - row.balance[lower] >= top * LABEL_GAP;
    const names = this.names();
    const spending = projection.drawdownMonths > 0;
    for (const id of clear ? ids : [lower]) {
      const value = row.balance[id];
      out[`dot-${id}`] = {
        type: 'point',
        xValue: x,
        yValue: value,
        radius: 4,
        backgroundColor: cssColor(id === 'a' ? '--fee-a' : '--fee-b', '#5c675f'),
        borderColor: surface,
        borderWidth: 2,
      };
      out[`label-${id}`] = {
        type: 'label',
        xValue: x,
        yValue: value,
        position: { x: 'start', y: spending ? 'start' : 'center' },
        xAdjust: 10,
        yAdjust: spending ? 22 : 0,
        content: [formatMoney(value), names[id]],
        color: ink,
        font: { size: 12, weight: 600 },
        textAlign: 'left',
        // A halo in the surface colour keeps the text legible where it crosses a line.
        backgroundColor: hexAlpha(surface, 0.88),
        padding: { x: 4, y: 2 },
        borderRadius: 4,
      };
    }
    return out;
  }
}
