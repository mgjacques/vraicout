import { ChangeDetectionStrategy, Component, computed, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { NumberField } from './number-field';

/** At rest: the number in French, then its unit, as in `2,5 %`, `65 ans` or `1985`. */
export function numberDisplay(
  value: number | null,
  maxFractionDigits = 0,
  suffix = '',
  grouping = true,
): string {
  if (value === null) return '';
  const text = new Intl.NumberFormat('fr-CA', {
    useGrouping: grouping,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
  return text + suffix;
}

/** A rate, an age, a year or hours: the bare number while typing, the number and its unit once left. */
@Component({
  selector: 'app-number-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputText],
  host: { style: 'display: block' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NumberInput), multi: true },
  ],
  template: `<input
      #field
      pInputText
      fluid
      type="text"
      [attr.inputmode]="inputMode()"
      autocomplete="off"
      [id]="inputId()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      [attr.aria-describedby]="boundNote() ? noteId() : null"
      (focus)="onFocus()"
      (input)="onInput()"
      (blur)="onBlur()"
    />
    <p class="field-bound" [id]="noteId()" aria-live="polite">{{ boundNote() }}</p>`,
})
export class NumberInput extends NumberField {
  readonly maxFractionDigits = input(0);
  /** Shown after the number at rest, its space included: ` %`, ` ans`, ` h`. */
  readonly suffix = input('');
  /** False for years: `1985`, not `1 985`. */
  readonly grouping = input(true);
  /** Phones show a keypad without a decimal sign for whole numbers. */
  readonly inputMode = computed(() => (this.maxFractionDigits() > 0 ? 'decimal' : 'numeric'));

  protected display(value: number | null): string {
    return numberDisplay(value, this.maxFractionDigits(), this.suffix(), this.grouping());
  }
}
