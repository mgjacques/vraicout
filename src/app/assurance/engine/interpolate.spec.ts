import { describe, expect, it } from 'vitest';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('draws a straight line when the left anchor is zero', () => {
    const hit = interpolate(5, [
      { month: 0, value: 0 },
      { month: 10, value: 100 },
    ]);
    expect(hit?.method).toBe('linear');
    expect(hit?.value).toBeCloseTo(50, 8);
  });

  it('uses an exponential curve between two positive anchors', () => {
    const hit = interpolate(5, [
      { month: 0, value: 100 },
      { month: 10, value: 400 },
    ]);
    expect(hit?.method).toBe('exp');
    expect(hit?.value).toBeCloseTo(200, 8);
  });

  it('reproduces the v2 guaranteed scale', () => {
    const scale = [
      { month: 14, value: 0 },
      { month: 24, value: 169 },
      { month: 72, value: 2475 },
      { month: 132, value: 9313 },
      { month: 192, value: 13307 },
      { month: 480, value: 27542 },
    ];
    expect(interpolate(14, scale)?.value).toBe(0);
    expect(interpolate(19, scale)?.method).toBe('linear');
    expect(interpolate(19, scale)?.value).toBeCloseTo((169 * 5) / 10, 8);
    expect(interpolate(192, scale)?.value).toBe(13307);
    const midpoint = interpolate(48, scale);
    const expected = Math.exp(Math.log(169) + 0.5 * (Math.log(2475) - Math.log(169)));
    expect(midpoint?.method).toBe('exp');
    expect(midpoint?.value).toBeCloseTo(expected, 6);
  });

  it('reproduces the v2 projected cash-value curve', () => {
    const scale = [
      { month: 0, value: 113.58 },
      { month: 192, value: 19500 },
      { month: 480, value: 55000 },
    ];
    expect(interpolate(0, scale)?.value).toBeCloseTo(113.58, 5);
    expect(interpolate(192, scale)?.method).toBe('anchor');
    const t = 96 / 192;
    const expected = Math.exp(Math.log(113.58) + t * (Math.log(19500) - Math.log(113.58)));
    expect(interpolate(96, scale)?.method).toBe('exp');
    expect(interpolate(96, scale)?.value).toBeCloseTo(expected, 4);
  });

  it('stays flat with a single anchor and holds the last value afterwards', () => {
    expect(interpolate(8, [{ month: 0, value: 40 }])?.method).toBe('flat');
    const held = interpolate(30, [
      { month: 0, value: 10 },
      { month: 12, value: 80 },
    ]);
    expect(held?.method).toBe('hold');
    expect(held?.value).toBe(80);
  });

  it('returns nothing before the first anchor', () => {
    expect(interpolate(3, [{ month: 10, value: 50 }])).toBeNull();
  });
});
