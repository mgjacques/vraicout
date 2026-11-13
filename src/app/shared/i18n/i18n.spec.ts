import { describe, expect, it } from 'vitest';
import { ALL_TOOL_CATALOGS, BASE_MESSAGES, TOOL_CATALOGS } from './catalogs';
import { en } from './en';
import { I18nService } from './i18n.service';
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

describe('catalogs loaded by route', () => {
  it('splits the French catalog without losing a key: the shared texts plus each tool', async () => {
    const tools = await Promise.all(ALL_TOOL_CATALOGS.map((name) => TOOL_CATALOGS[name]()));
    const base = Object.keys(BASE_MESSAGES);
    const split = [...base, ...tools.flatMap((texts) => Object.keys(texts))];
    expect(new Set(split)).toEqual(new Set(Object.keys(fr)));
    expect(base).not.toContain('title.fees');
  });

  it('gives every text once the catalogs are loaded, as the test setup does', () => {
    const i18n = new I18nService();
    expect(i18n.t('home.title')).toBe(fr['home.title']);
    expect(i18n.t('title.fees')).toBe(fr['title.fees']);
  });
});
