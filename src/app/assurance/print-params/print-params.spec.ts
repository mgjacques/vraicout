import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PrintParams } from './print-params';

describe('PrintParams', () => {
  beforeEach(() => localStorage.clear());

  it('groups the figures as the settings panel does', () => {
    const groups = TestBed.createComponent(PrintParams).componentInstance.groups();
    expect(groups.map((group) => group.title)).toEqual([
      'Vous',
      'L’assurance permanente',
      'La temporaire qu’on vous propose',
      'Vos hypothèses de placement',
    ]);
    expect(groups.every((group) => group.rows.every((row) => row.value !== ''))).toBe(true);
  });
});
