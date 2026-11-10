import { describe, expect, it } from 'vitest';
import { ANNUAL_PAY_MAX, payMax, withFrequency } from './pay';

describe('payMax', () => {
  it('caps each pay so the year stays under the annual cap', () => {
    expect(payMax('year')).toBe(ANNUAL_PAY_MAX);
    // 1 000 000 $ ÷ 26 = 38 461,54 $, to the dollar.
    expect(payMax('biweekly')).toBe(38_462);
    expect(payMax('month')).toBe(83_333);
  });

  it('keeps a capped pay under the cap when its frequency changes', () => {
    const converted = withFrequency({ frequency: 'year', salary: ANNUAL_PAY_MAX }, 'biweekly');
    expect(converted.salary).toBeLessThanOrEqual(payMax('biweekly'));
  });
});
