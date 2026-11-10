import { Chart, Plugin } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { formatMoney } from '../engine/formulas';
import { printHooks } from '../print/print-hooks';

Chart.register(annotationPlugin);

/** Charts redraw at the paper's width, and in light colours without animating from zero. */
let screenAnimation = Chart.defaults.animation;
printHooks.add({
  before() {
    screenAnimation = Chart.defaults.animation;
    Chart.defaults.animation = false;
    for (const chart of Object.values(Chart.instances)) chart.resize();
  },
  after() {
    Chart.defaults.animation = screenAnimation;
    for (const chart of Object.values(Chart.instances)) chart.resize();
  },
});

/** A colour from the global stylesheet, so charts follow the CSS variables. */
export function cssColor(variable: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || fallback;
}

/** A `#rrggbb` colour made see-through, for halos and filled areas. */
export function hexAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  if (value.length !== 6) return hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatAxis(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 }).format(Math.round(value / 1000))}\u00a0k$`;
  }
  return formatMoney(value);
}

/** A solid hairline that follows the hovered X, so readers aim at a year, not at a 2px line. */
export const crosshairPlugin: Plugin = {
  id: 'crosshair',
  afterDatasetsDraw(chart) {
    const active = chart.tooltip?.getActiveElements() ?? [];
    if (!active.length) return;
    const x = active[0].element.x;
    const { top, bottom } = chart.chartArea;
    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = cssColor('--muted', '#5c675f');
    ctx.stroke();
    ctx.restore();
  },
};
