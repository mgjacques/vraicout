import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { NumberField } from '../number-input/number-field';

/** At rest: `1 000 $`, with cents only when there are some. */
export function moneyDisplay(value: number | null, maxFractionDigits = 2): string {
  if (value === null) return '';
  const cents = maxFractionDigits > 0 && !Number.isInteger(value);
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: cents ? maxFractionDigits : 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

/** A dollar amount: the bare number while typing, `1 000 $` once left. */
@Component({
  selector: 'app-money-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputText],
  host: { style: 'display: block' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MoneyInput), multi: true },
  ],
  template: `<input
      #field
      pInputText
      fluid
      type="text"
      inputmode="decimal"
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
export class MoneyInput extends NumberField {
  readonly maxFractionDigits = input(2);

  protected display(value: number | null): string {
    return moneyDisplay(value, this.maxFractionDigits());
  }
}
