import { describe, expect, it } from 'vitest';
import { toMonthlyRate } from './rates';

describe('toMonthlyRate', () => {
  it('gives back the yearly rate over twelve months', () => {
    expect(Math.pow(1 + toMonthlyRate(0.06), 12) - 1).toBeCloseTo(0.06, 12);
    // 6 % a year is about 0.487 % a month, a little under 6 % ÷ 12.
    expect(toMonthlyRate(0.06)).toBeCloseTo(0.004868, 6);
  });

  it('keeps a zero rate at zero', () => {
    expect(toMonthlyRate(0)).toBe(0);
  });
});
