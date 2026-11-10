import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { formatHours, formatMoney, formatMoneyExact, formatPercent } from '../engine/formulas';
import { Money } from '../engine/money';
import { I18nService } from '../i18n/i18n.service';
import { FormulaService } from './formula.service';

/** What the amount counts: dollars, a duration in hours or working days, or a share in percent. */
export type FigureUnit = 'money' | 'hours' | 'days' | 'percent';

@Component({
  selector: 'app-figure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './figure.html',
})
export class Figure {
  readonly money = input.required<Money>();
  /** Cents shown, for amounts under a few dollars. */
  readonly exact = input(false);
  readonly unit = input<FigureUnit>('money');
  private readonly i18n = inject(I18nService);
  private readonly formulas = inject(FormulaService);

  readonly text = computed(() => {
    const value = this.money().value;
    switch (this.unit()) {
      case 'hours':
        return formatHours(value) + this.i18n.t('unit.hours');
      case 'days':
        // French keeps the singular under 2: « 1,5 jour ».
        return formatHours(value) + this.i18n.t(value < 2 ? 'unit.day' : 'unit.days');
      case 'percent':
        return formatPercent(value);
      default:
        return this.exact() ? formatMoneyExact(value) : formatMoney(value);
    }
  });
  readonly aria = computed(() => `${this.text()}. ${this.i18n.t('figure.formula')}`);

  enter(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    this.formulas.hover(event.currentTarget as HTMLElement, this.explanation());
  }

  leave(): void {
    this.formulas.leave();
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.formulas.toggle(event.currentTarget as HTMLElement, this.explanation());
  }

  private explanation(): string {
    return this.i18n.explainMoney(this.money());
  }
}
