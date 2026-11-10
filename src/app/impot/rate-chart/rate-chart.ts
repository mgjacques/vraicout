import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import { UIChart } from 'primeng/chart';
import { Panel } from 'primeng/panel';
import { crosshairPlugin, cssColor, formatAxis } from '../../shared/charts/chart-style';
import { formatMoney, formatPercent } from '../../shared/engine/formulas';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ThemeService } from '../../shared/theme/theme.service';
import { CHART_MAX } from '../engine/marginal';
import { MarginalStore } from '../state/marginal.store';

/**
 * The combined marginal rate as a staircase over income, a solid line at the entered income and
 * a dashed one with the extra income. One series: the title names it, no legend. The table
 * under it gives the same steps, federal and Québec apart.
 */
@Component({
  selector: 'app-rate-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UIChart, Panel],
  template: `
    <section class="block">
      <article class="chart-card">
        <h2>{{ i18n.t('marginal.chart.title') }}</h2>
        <p class="help">{{ i18n.t('marginal.chart.sub') }}</p>
        <div class="chart-frame">
          <p-chart
            type="line"
            [data]="data()"
            [options]="options()"
            [plugins]="plugins"
            [ariaLabel]="i18n.t('marginal.chart.aria')"
            height="320"
          />
        </div>
        @if (beyond(); as note) {
          <p class="help">{{ note }}</p>
        }
      </article>
    </section>

    <section class="block">
      <p-panel
        class="guide"
        [header]="i18n.t('marginal.table.heading')"
        [toggleable]="true"
        [collapsed]="true"
      >
        <div class="marginal-table">
          <table>
            <thead>
              <tr>
                <th scope="col">{{ i18n.t('marginal.table.income') }}</th>
                <th scope="col">{{ i18n.t('marginal.table.federal') }}</th>
                <th scope="col">{{ i18n.t('marginal.table.quebec') }}</th>
                <th scope="col">{{ i18n.t('marginal.table.combined') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.from) {
                <tr [class.current]="row.current">
                  <th scope="row">{{ row.label }}</th>
                  <td>{{ row.federal }}</td>
                  <td>{{ row.quebec }}</td>
                  <td>{{ row.combined }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </p-panel>
    </section>
  `,
})
export class RateChart {
  private readonly store = inject(MarginalStore);
  /** Colours come from CSS variables; reading this recomputes the chart when the theme flips. */
  private readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly plugins = [crosshairPlugin];

  readonly data = computed(() => {
    this.theme.dark();
    const { steps } = this.store.projection();
    const color = cssColor('--marginal-rate', '#00846f');
    // The last step runs to the chart's edge.
    const points = [
      ...steps.map((step) => ({ x: step.from, y: step.percent })),
      { x: CHART_MAX, y: steps.at(-1)?.percent ?? 0 },
    ];
    return {
      datasets: [
        {
          label: this.i18n.t('marginal.chart.rate'),
          data: points,
          stepped: 'before' as const,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          borderCapStyle: 'round' as const,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: cssColor('--surface', '#fffdf8'),
          fill: false,
        },
      ],
    };
  });

  readonly options = computed<ChartOptions>(() => {
    this.theme.dark();
    const muted = cssColor('--muted', '#5c675f');
    const line = cssColor('--line', '#e2dbd0');
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) =>
              this.i18n.t('marginal.chart.from', { income: formatMoney(items[0]?.parsed.x ?? 0) }),
            label: (context) => formatPercent(context.parsed.y ?? 0),
          },
        },
        annotation: { clip: false, annotations: this.annotations() },
      },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: CHART_MAX,
          title: { display: true, text: this.i18n.t('marginal.chart.axis'), color: muted },
          ticks: { color: muted, maxRotation: 0, callback: (value) => formatAxis(Number(value)) },
          grid: { color: line },
          border: { color: line },
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: muted, callback: (value) => formatPercent(Number(value)) },
          grid: { color: line },
          border: { color: line },
        },
      },
    };
  });

  /** When the income passes the chart's edge, the rate past it, which no longer changes. */
  readonly beyond = computed(() => {
    const { input, steps } = this.store.projection();
    if (input.income + input.extra <= CHART_MAX) return null;
    return this.i18n.t('marginal.chart.beyond', {
      max: formatMoney(CHART_MAX),
      percent: formatPercent(steps.at(-1)?.percent ?? 0),
    });
  });

  readonly rows = computed(() => {
    const { steps, input } = this.store.projection();
    return steps.map((step, index) => {
      const next = steps[index + 1]?.from;
      return {
        from: step.from,
        label:
          next === undefined
            ? this.i18n.t('marginal.table.over', { from: formatMoney(step.from) })
            : this.i18n.t('marginal.table.range', {
                from: formatMoney(step.from),
                to: formatMoney(next),
              }),
        federal: formatPercent(step.federalPercent),
        quebec: formatPercent(step.quebecPercent),
        combined: formatPercent(step.percent),
        current: input.income >= step.from && (next === undefined || input.income < next),
      };
    });
  });

  /**
   * Unlabelled lines, which the subtitle names: a label at the top would hide the staircase
   * once the income nears the chart's right edge. Past the edge, the line stays on it.
   */
  private annotations(): Record<string, AnnotationOptions> {
    const { input } = this.store.projection();
    const ink = cssColor('--ink', '#1c2421');
    const marker = (value: number, dash: number[]): AnnotationOptions => ({
      type: 'line',
      scaleID: 'x',
      value: Math.min(value, CHART_MAX),
      borderColor: ink,
      borderWidth: 1.5,
      borderDash: dash,
    });
    const out: Record<string, AnnotationOptions> = { income: marker(input.income, []) };
    if (input.extra > 0) out['extra'] = marker(input.income + input.extra, [5, 4]);
    return out;
  }
}
