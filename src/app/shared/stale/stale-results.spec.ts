import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { StaleResults } from './stale-results';

@Component({
  imports: [StaleResults],
  template: `<app-stale-results [stale]="stale()"><p class="result">42</p></app-stale-results>`,
})
class Host {
  readonly stale = signal(false);
}

describe('StaleResults', () => {
  it('greys the results under a note only while the form is incomplete', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('app-stale-results');
    expect(host.classList).not.toContain('stale');
    expect(host.querySelector('.stale-note')).toBeNull();

    fixture.componentInstance.stale.set(true);
    await fixture.whenStable();
    expect(host.classList).toContain('stale');
    expect(host.querySelector('.stale-note')?.textContent).toContain('derniers chiffres complets');
    expect(host.querySelector('.result')?.textContent).toBe('42');
  });
});
