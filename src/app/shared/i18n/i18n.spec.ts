import { describe, expect, it } from 'vitest';
import { en } from './en';
import { fr } from './fr';

describe('catalogs', () => {
  it('keeps an empty English catalog with the same keys as French', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
    for (const value of Object.values(en)) expect(value).toBe('');
    for (const value of Object.values(fr)) expect(value.length).toBeGreaterThan(0);
  });

  it('never lets a line break split a number from its unit or its thousands', () => {
    const broken = Object.entries(fr).filter(([, value]) =>
      /[\d}] (%|k?\$)|\d \d{3}(?!\d)/.test(value),
    );
    expect(broken).toEqual([]);
  });
});
