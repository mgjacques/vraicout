import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { formatMoney } from '../../shared/engine/formulas';
import { exampleScenario } from '../engine/example';
import { projectMonth, strategy } from '../engine/project';
import { ScenarioInput } from '../engine/types';
import { ScenarioStore } from '../state/scenario.store';
import { MilestoneCards } from './milestone-cards';

/** The example's policy without its value table: the cash value stays at today's amount. */
function withoutTable(): ScenarioInput {
  const input = exampleScenario();
  return { ...input, permanent: { ...input.permanent, anchors: [] } };
}

function cards(input: ScenarioInput = exampleScenario()) {
  TestBed.inject(ScenarioStore).committed.set(input);
  const fixture = TestBed.createComponent(MilestoneCards);
  return { fixture, cards: fixture.componentInstance };
}

describe('MilestoneCards', () => {
  beforeEach(() => localStorage.clear());

  it('warns, and gives no even return, when no future cash value is entered', () => {
    const component = cards(withoutTable()).cards;
    expect(component.notes().join(' ')).toContain('Sans lignes du tableau du contrat');
    expect(component.breakEven()).toBe('');
  });

  it('gives the even return and no warning when the table is entered', () => {
    const component = cards().cards;
    expect(component.breakEven()).not.toBe('');
    expect(component.notes().join(' ')).not.toContain('Sans lignes du tableau du contrat');
  });

  it('opens at the end of the term and reads any age picked', () => {
    const component = cards().cards;
    // The example's 25-year term starts at 30.
    expect(component.focus().age).toBe(55);
    expect(component.shortcuts().map((item) => item.age)).toEqual([54, 55, 65, 70]);

    component.setAge(47);
    expect(component.focus().age).toBe(47);
    expect(component.focus().strategies).toEqual(projectMonth(exampleScenario(), 17 * 12));
    expect(component.detail()).toBe('');
  });

  it('keeps the age picked within the projection', () => {
    const component = cards().cards;
    component.setAge(10);
    expect(component.focus().age).toBe(30);
    component.setAge(200);
    expect(component.focus().age).toBe(70);
    component.setAge(null);
    expect(component.focus().age).toBe(70);
  });

  it('says how far apart the two options are, from the engine’s totals', () => {
    const component = cards().cards;
    component.setAge(65);
    const keep = strategy(component.focus().strategies, 'keep');
    const term = strategy(component.focus().strategies, 'termInvest');
    const gap = component.aliveGap();
    expect(gap.ahead).toBe(term.inHand.value > keep.inHand.value ? 'termInvest' : 'keep');
    expect(gap.text).toContain(formatMoney(Math.abs(term.inHand.value - keep.inHand.value)));
  });

  it('says how much more the premiums cost first', () => {
    const gap = cards().cards.costGap();
    expect(gap.ahead).toBe('keep');
    expect(gap.text).toContain('de primes de plus');
  });

  it('says what getting the cash value costs when it puts the permanent ahead', () => {
    const input = exampleScenario();
    // At 0 %, the invested difference stays small and the cash value of 70 000 $ leads.
    const component = cards({ ...input, params: { ...input.params, annualReturn: 0 } }).cards;
    component.setAge(70);
    expect(component.aliveGap().ahead).toBe('keep');
    expect(component.aliveGap().text).toContain('mettant fin au contrat');
    expect(component.aliveGap().text).toContain(formatMoney(100_000));
  });

  it('flags the straight line drawn from 0 $ and gives no even return on it', () => {
    const input = exampleScenario();
    const component = cards({ ...input, permanent: { ...input.permanent, cashValueNow: 0 } }).cards;
    component.setAge(40);
    expect(component.cashLine()).toContain('Entre 30 et 50');
    expect(component.breakEven()).toBe('');

    // Past the first row of the table, the value is the contract's own again.
    component.setAge(60);
    expect(component.cashLine()).toBe('');
    expect(component.breakEven()).not.toBe('');
  });

  it('names the cash value received today and recalls how to replace a contract in force', () => {
    const component = cards().cards;
    expect(component.termAliveHelp()).toContain('qui partent de la valeur de rachat');
    expect(component.notes()[0]).toContain('Ne mettez jamais fin à la permanente');

    const input = exampleScenario();
    const proposed = cards({ ...input, permanent: { ...input.permanent, inForce: false } }).cards;
    expect(proposed.termAliveHelp()).not.toContain('valeur de rachat');
    expect(proposed.notes().join(' ')).not.toContain('Ne mettez jamais fin');
  });

  it('shows no insurance part once the term is over', () => {
    const component = cards().cards;
    component.setAge(55);
    expect(component.termDeathParts()).toBe('');
    component.setAge(54);
    expect(component.termDeathParts()).toContain('250');
  });

  it('shows the extra savings once, apart from both options', async () => {
    const input = exampleScenario();
    const { fixture } = cards({ ...input, params: { ...input.params, extraSavingsMonthly: 100 } });
    await fixture.whenStable();
    const text: string = fixture.nativeElement.textContent;
    expect(text.match(/Épargne supplémentaire/g)?.length).toBe(1);
  });
});
