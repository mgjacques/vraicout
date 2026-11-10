import {
  AfterViewInit,
  Directive,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { I18nService } from '../i18n/i18n.service';
import { numberDraft, parseNumber } from './number-text';

/**
 * A typed number, in place of PrimeNG's InputNumber: that one keeps the caret hopping
 * around its prefix and suffix, swallows keys and reads a typed period as nothing (`12.50`
 * became 1 250). This field shows the bare number while focused, so it edits like plain
 * text, and formats it on the way out. Never negative. Subclasses say how it reads at rest.
 */
@Directive()
export abstract class NumberField implements ControlValueAccessor, AfterViewInit {
  readonly inputId = input<string>();
  readonly invalid = input(false);
  readonly min = input<number>();
  readonly max = input<number>();
  readonly disabled = signal(false);
  abstract readonly maxFractionDigits: () => number;
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  private readonly i18n = inject(I18nService);
  private readonly value = signal<number | null>(null);
  /** The bound the last typed number was brought back to, so the field can say so. */
  private readonly heldAt = signal<'min' | 'max' | null>(null);
  /** « Maximum : 60 ans… » under the field, empty while the number is within bounds. */
  readonly boundNote = computed(() => {
    const bound = this.heldAt();
    const limit = bound === 'max' ? this.max() : bound === 'min' ? this.min() : undefined;
    if (limit === undefined) return '';
    return this.i18n.t(bound === 'max' ? 'field.max' : 'field.min', {
      value: this.display(limit),
    });
  });
  readonly noteId = computed(() => {
    const id = this.inputId();
    return id ? `${id}-bound` : null;
  });
  private focused = false;
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  /** The value at rest, as the field shows it once left. */
  protected abstract display(value: number | null): string;

  /**
   * As PrimeNG's InputNumber did, `max` holds while typing (150 in an age capped at 110
   * gives 110) and `min` only on the way out, so 1 can be typed on the way to 18.
   */
  private whileTyping(value: number): number {
    const max = this.max();
    return max === undefined ? value : Math.min(value, max);
  }

  private onLeave(value: number): number {
    const min = this.min();
    return min === undefined ? value : Math.max(value, min);
  }

  private hold(typed: number | null, kept: number | null, bound: 'min' | 'max'): void {
    this.heldAt.set(typed !== null && typed !== kept ? bound : null);
  }

  constructor() {
    // A new unit or number of decimals (« ans » becoming a year) shows at once.
    effect(() => {
      const text = this.display(this.value());
      if (!this.focused) this.show(text);
    });
  }

  ngAfterViewInit(): void {
    this.show(this.display(this.value()));
  }

  writeValue(value: number | null): void {
    this.value.set(value ?? null);
    // While typing, the form echoes back (and may round) what was just typed: rewriting
    // the text then would move the caret. The blur shows the final value.
    if (!this.focused) this.show(this.display(this.value()));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  onFocus(): void {
    this.focused = true;
    this.show(numberDraft(this.value(), this.maxFractionDigits()));
  }

  onInput(): void {
    const typed = parseNumber(this.field()?.nativeElement.value ?? '', this.maxFractionDigits());
    const value = typed === null ? null : this.whileTyping(typed);
    this.hold(typed, value, 'max');
    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.focused = false;
    const value = this.value();
    if (value !== null) {
      const bounded = this.onLeave(value);
      if (bounded !== value) {
        this.heldAt.set('min');
        this.value.set(bounded);
        this.onChange(bounded);
      }
    }
    this.show(this.display(this.value()));
    this.onTouched();
  }

  private show(text: string): void {
    const field = this.field()?.nativeElement;
    if (field) field.value = text;
  }
}
