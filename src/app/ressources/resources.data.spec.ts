import { describe, expect, it } from 'vitest';
import { RESOURCE_SECTIONS } from './resources.data';

const entries = RESOURCE_SECTIONS.flatMap((section) => section.entries);

describe('RESOURCE_SECTIONS', () => {
  it('has no empty section and unique anchors', () => {
    for (const section of RESOURCE_SECTIONS) {
      expect(section.entries.length).toBeGreaterThan(0);
    }
    const ids = RESOURCE_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lists each resource once', () => {
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    const titles = entries.map((entry) => entry.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('links in https, never to a shop or an affiliate site', () => {
    for (const { url } of entries) {
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toMatch(/hardbacon|milesopedia|amazon|amzn/);
    }
  });
});
