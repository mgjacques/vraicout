import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { exampleScenario } from '../engine/example';
import { ScenarioStore } from '../state/scenario.store';
import { ChartPanel } from './chart-panel';

describe('ChartPanel', () => {
  beforeEach(() => localStorage.clear());

  it('marks the age read in the table above', () => {
    const store = TestBed.inject(ScenarioStore);
    store.committed.set(exampleScenario());
    const fixture = TestBed.createComponent(ChartPanel);
    fixture.componentRef.setInput('mode', 'death');
    const focusLine = () =>
      (
        fixture.componentInstance.options().plugins?.annotation?.annotations as Record<
          string,
          { value?: number }
        >
      )['focus'];

    expect(focusLine()?.value).toBe(55);
    store.chosenAge.set(62);
    expect(focusLine()?.value).toBe(62);
  });
});
