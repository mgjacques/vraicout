import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { NumberInput, numberDisplay } from './number-input';

const spaces = (text: string) => text.replace(/\s/g, ' ');

describe('numberDisplay', () => {
  it('writes the number in French, then its unit', () => {
    expect(numberDisplay(2.5, 2, ' %')).toBe('2,5 %');
    expect(numberDisplay(37.5, 2, ' h')).toBe('37,5 h');
    expect(numberDisplay(65, 0, ' ans')).toBe('65 ans');
    expect(numberDisplay(null, 0, ' ans')).toBe('');
  });

  it('groups thousands, except for years', () => {
    expect(spaces(numberDisplay(1500))).toBe('1 500');
    expect(numberDisplay(1985, 0, '', false)).toBe('1985');
  });
});

@Component({
  imports: [NumberInput, FormsModule],
  template: `<app-number-input
    inputId="rate"
    [(ngModel)]="rate"
    [maxFractionDigits]="2"
    [min]="1"
    [max]="15"
    [suffix]="unit()"
  />`,
})
class Host {
  readonly rate = signal<number | null>(5);
  readonly unit = signal(' %');
}

async function field() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const input: HTMLInputElement = fixture.nativeElement.querySelector('#rate');
  const type = (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  };
  return { fixture, input, type };
}

describe('NumberInput', () => {
  it('edits the bare number and shows its unit on blur', async () => {
    const { fixture, input, type } = await field();
    expect(input.value).toBe('5 %');

    input.dispatchEvent(new Event('focus'));
    expect(input.value).toBe('5');

    type('2.5');
    expect(fixture.componentInstance.rate()).toBe(2.5);
    type('2,75');
    expect(fixture.componentInstance.rate()).toBe(2.75);

    input.dispatchEvent(new Event('blur'));
    expect(input.value).toBe('2,75 %');
  });

  it('holds the maximum while typing and the minimum on the way out', async () => {
    const { fixture, input, type } = await field();
    input.dispatchEvent(new Event('focus'));

    type('40');
    expect(fixture.componentInstance.rate()).toBe(15);

    type('0,5');
    expect(fixture.componentInstance.rate()).toBe(0.5);
    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.rate()).toBe(1);
    expect(input.value).toBe('1 %');
  });

  it('shows a new unit at once, without waiting for a new value', async () => {
    const { fixture, input } = await field();
    fixture.componentInstance.unit.set(' ans');
    await fixture.whenStable();
    expect(input.value).toBe('5 ans');
  });

  it('says which bound a typed number was brought back to', async () => {
    const { fixture, input, type } = await field();
    const note = () => spaces(fixture.nativeElement.querySelector('#rate-bound').textContent);
    input.dispatchEvent(new Event('focus'));

    type('40');
    await fixture.whenStable();
    expect(note()).toBe('Maximum : 15 %. Le calcul utilise ce nombre.');
    expect(input.getAttribute('aria-describedby')).toBe('rate-bound');

    type('4');
    await fixture.whenStable();
    expect(note()).toBe('');
    expect(input.hasAttribute('aria-describedby')).toBe(false);

    type('0,5');
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(note()).toBe('Minimum : 1 %. Le calcul utilise ce nombre.');
  });

  it('gives null for an emptied field, and leaves it empty', async () => {
    const { fixture, input, type } = await field();
    input.dispatchEvent(new Event('focus'));
    type('');
    input.dispatchEvent(new Event('blur'));
    expect(fixture.componentInstance.rate()).toBeNull();
    expect(input.value).toBe('');
  });
});
