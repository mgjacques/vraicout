import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { crosshairPlugin, cssColor, formatAxis, hexAlpha } from '../../shared/charts/chart-style';
import { formatMoney } from '../../shared/engine/formulas';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ThemeService } from '../../shared/theme/theme.service';
import { SavingsStore } from '../state/savings.store';

/**
 * The balance by year as two filled bands: the deposits at the bottom, the interest on top,
 * so the band that grows is the one compounding builds. The late start is a dashed line.
 */
@Component({
  selector: 'app-savings-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UIChart],
  template: `
    <section class="block">
      <article class="chart-card">
        <h2>{{ i18n.t('savings.chart.title') }}</h2>
        <p class="help">{{ i18n.t('savings.chart.sub') }}</p>
        <div class="chart-frame">
          <p-chart
            type="line"
            [data]="data()"
            [options]="options()"
            [plugins]="plugins"
            [ariaLabel]="i18n.t('savings.chart.aria')"
            height="320"
          />
        </div>
      </article>
    </section>
  `,
})
export class SavingsChart {
  private readonly store = inject(SavingsStore);
  /** Colours come from CSS variables; reading this recomputes the chart when the theme flips. */
  private readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly plugins = [crosshairPlugin];

  readonly data = computed(() => {
    this.theme.dark();
    const { rows, late, input } = this.store.projection();
    const deposited = cssColor('--savings-deposited', '#3f4542');
    const interest = cssColor('--savings-interest', '#00846f');
    const lateColor = cssColor('--savings-late', '#9a3412');
    const line = {
      borderWidth: 2,
      borderCapStyle: 'round' as const,
      borderJoinStyle: 'round' as const,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBorderWidth: 2,
      pointHoverBorderColor: cssColor('--surface', '#fffdf8'),
      tension: 0,
    };
    const band = (label: string, data: number[], color: string, fill: string) => ({
      ...line,
      label,
      data,
      borderColor: color,
      backgroundColor: hexAlpha(color, 0.28),
      fill,
    });
    const datasets = [
      band(
        this.i18n.t('savings.chart.deposited'),
        rows.map((row) => row.deposited),
        deposited,
        'origin',
      ),
      // The top of the band is the balance; the tooltip shows the band's own height.
      band(
        this.i18n.t('savings.chart.interest'),
        rows.map((row) => row.balance),
        interest,
        '-1',
      ),
      ...(late
        ? [
            {
              ...line,
              label: this.i18n.t('savings.chart.late', { delay: input.delayYears }),
              data: rows.map((row) => row.late ?? 0),
              borderColor: lateColor,
              backgroundColor: lateColor,
              fill: false,
              borderDash: [6, 4],
            },
          ]
        : []),
    ];
    return { labels: rows.map((row) => String(row.year)), datasets };
  });

  readonly options = computed<ChartOptions>(() => {
    this.theme.dark();
    const { rows } = this.store.projection();
    const ink = cssColor('--ink', '#1c2421');
    const muted = cssColor('--muted', '#5c675f');
    const line = cssColor('--line', '#e2dbd0');
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: ink, boxWidth: 18, boxHeight: 10, padding: 14 },
        },
        tooltip: {
          callbacks: {
            title: (items) => this.i18n.t('savings.chart.year', { year: items[0]?.label ?? '' }),
            // The value leads; the series name follows. Interest is the band, not its top.
            label: (context) => {
              const value =
                context.datasetIndex === 1
                  ? (context.parsed.y ?? 0) - rows[context.dataIndex].deposited
                  : (context.parsed.y ?? 0);
              return `${formatMoney(value)}  ${context.dataset.label ?? ''}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: this.i18n.t('savings.chart.axis'), color: muted },
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
}
