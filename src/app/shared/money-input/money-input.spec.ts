import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { numberDraft, parseNumber } from '../number-input/number-text';
import { MoneyInput, moneyDisplay } from './money-input';

describe('parseNumber', () => {
  it('reads a comma or a period as the decimal sign', () => {
    expect(parseNumber('12,50')).toBe(12.5);
    expect(parseNumber('12.50')).toBe(12.5);
  });

  it('reads an amount pasted with its spaces, thousands separators and dollar sign', () => {
    expect(parseNumber('1 234,56 $')).toBe(1234.56);
    expect(parseNumber('1,234.56')).toBe(1234.56);
    expect(parseNumber('$1,000')).toBe(1000);
    expect(parseNumber('2.500')).toBe(2500);
  });

  it('gives null when there is no digit', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber(' $')).toBeNull();
    expect(parseNumber(',')).toBeNull();
  });

  it('rounds to the allowed decimals and never goes negative', () => {
    expect(parseNumber('10,9999')).toBe(11);
    expect(parseNumber('1500,60', 0)).toBe(1501);
    expect(parseNumber('-25')).toBe(25);
  });
});

describe('numberDraft and moneyDisplay', () => {
  it('shows the bare number while typing', () => {
    expect(numberDraft(1000.5)).toBe('1000,5');
    expect(numberDraft(null)).toBe('');
  });

  it('formats at rest, with cents only when there are some', () => {
    expect(moneyDisplay(1000).replace(/\s/g, ' ')).toBe('1 000 $');
    expect(moneyDisplay(12.5).replace(/\s/g, ' ')).toBe('12,50 $');
    expect(moneyDisplay(null)).toBe('');
  });
});

@Component({
  imports: [MoneyInput, FormsModule],
  template: `<app-money-input inputId="amount" [(ngModel)]="amount" [max]="5000" />`,
})
class Host {
  readonly amount = signal<number | null>(1000);
}

describe('MoneyInput', () => {
  it('edits the bare number and formats it on blur', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const field: HTMLInputElement = fixture.nativeElement.querySelector('#amount');
    expect(field.value.replace(/\s/g, ' ')).toBe('1 000 $');

    field.dispatchEvent(new Event('focus'));
    expect(field.value).toBe('1000');

    field.value = '12.50';
    field.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.amount()).toBe(12.5);

    field.dispatchEvent(new Event('blur'));
    expect(field.value.replace(/\s/g, ' ')).toBe('12,50 $');
  });

  it('holds the maximum while typing', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const field: HTMLInputElement = fixture.nativeElement.querySelector('#amount');
    field.dispatchEvent(new Event('focus'));
    field.value = '1000000';
    field.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.amount()).toBe(5000);
    field.dispatchEvent(new Event('blur'));
    expect(field.value.replace(/\s/g, ' ')).toBe('5 000 $');
  });
});
