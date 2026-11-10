import { InterpMethod } from './types';

export interface Anchor {
  month: number;
  value: number;
}

export interface InterpHit {
  value: number;
  method: InterpMethod;
  left: Anchor;
  right: Anchor;
}

/**
 * Contract-scale interpolation from the v2 model.
 * A zero (or negative) left anchor uses a straight line. Two positive anchors
 * use an exponential curve. Before the first anchor there is no value.
 * After the last anchor the value stays put — nothing is invented past the scale.
 */
export function interpolate(month: number, anchors: readonly Anchor[]): InterpHit | null {
  if (anchors.length === 0) return null;
  const sorted = [...anchors].sort((a, b) => a.month - b.month);
  const first = sorted[0];
  if (!first || month < first.month) return null;

  if (sorted.length === 1) {
    return { value: first.value, method: 'flat', left: first, right: first };
  }

  const exact = sorted.find((anchor) => anchor.month === month);
  if (exact) {
    return { value: exact.value, method: 'anchor', left: exact, right: exact };
  }

  const last = sorted[sorted.length - 1];
  if (!last || month > last.month) {
    return last ? { value: last.value, method: 'hold', left: last, right: last } : null;
  }

  for (let index = 1; index < sorted.length; index++) {
    const right = sorted[index];
    const left = sorted[index - 1];
    if (!left || !right || month > right.month) continue;
    return between(month, left, right);
  }
  return null;
}

function between(month: number, left: Anchor, right: Anchor): InterpHit {
  const span = right.month - left.month;
  const t = span === 0 ? 0 : (month - left.month) / span;
  if (left.value <= 0 || right.value <= 0) {
    return {
      value: left.value + (right.value - left.value) * t,
      method: 'linear',
      left,
      right,
    };
  }
  return {
    value: Math.exp(Math.log(left.value) + t * (Math.log(right.value) - Math.log(left.value))),
    method: 'exp',
    left,
    right,
  };
}
