import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { AnnotationOptions } from 'chartjs-plugin-annotation';
import { UIChart } from 'primeng/chart';
import { crosshairPlugin, cssColor, formatAxis } from '../../shared/charts/chart-style';
import { formatMoney } from '../../shared/engine/formulas';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ThemeService } from '../../shared/theme/theme.service';
import { personName } from '../person-name';
import { MortgageStore } from '../state/mortgage.store';

@Component({
  selector: 'app-mortgage-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UIChart],
  templateUrl: './mortgage-chart.html',
})
export class MortgageChart {
  private readonly store = inject(MortgageStore);
  /** Colours come from CSS variables; reading this recomputes the chart when the theme flips. */
  private readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly plugins = [crosshairPlugin];

  readonly data = computed(() => {
    this.theme.dark();
    const { rows, input, people } = this.store.projection();
    const term = cssColor('--mortgage-term', '#00846f');
    const series = [
      {
        label: this.i18n.t('mortgage.chart.bank'),
        data: rows.map((row) => row.balance),
        color: cssColor('--mortgage-bank', '#9a3412'),
        dashed: false,
        stepped: false,
      },
      ...people.map((id, index) => ({
        label: input.couple
          ? this.i18n.t('mortgage.chart.termOf', {
              name: personName(this.i18n, input.people[id].label, id),
            })
          : this.i18n.t('mortgage.option.term'),
        data: rows.map((row) => row.term[id]),
        color: term,
        dashed: index === 1,
        // Coverage holds for the whole year, then drops when the term ends.
        stepped: true,
      })),
    ];
    return {
      labels: rows.map((row) => String(row.year)),
      datasets: series.map((item) => ({
        label: item.label,
        data: item.data,
        borderColor: item.color,
        backgroundColor: item.color,
        borderDash: item.dashed ? [6, 4] : undefined,
        stepped: item.stepped ? ('after' as const) : false,
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
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: ink, boxWidth: 18, boxHeight: 2, padding: 14 },
        },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            title: (items) => this.i18n.t('mortgage.chart.year', { year: items[0]?.label ?? '' }),
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
          title: { display: true, text: this.i18n.t('mortgage.chart.axis'), color: muted },
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

  /** A line on the year the cards above look at. */
  private annotations(): Record<string, AnnotationOptions> {
    const muted = cssColor('--muted', '#5c675f');
    return {
      chosen: {
        type: 'line',
        scaleID: 'x',
        value: String(this.store.year()),
        borderColor: muted,
        borderDash: [4, 4],
        borderWidth: 1,
        label: {
          display: true,
          content: this.i18n.t('mortgage.chart.chosen', { year: this.store.year() }),
          position: 'start',
          backgroundColor: 'transparent',
          color: muted,
          font: { size: 11, weight: 'bold' },
        },
      },
    };
  }
}
