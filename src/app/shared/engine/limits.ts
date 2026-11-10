/**
 * What a field accepts. Wide on purpose: the bounds stop absurd projections, not real
 * situations. Every tool keeps its own in its `engine/limits.ts`; docs/limites-des-champs.md
 * lists them all, with the reason for each.
 */
export interface Limit {
  min: number;
  max: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampTo(value: number, limit: Limit): number {
  return clamp(value, limit.min, limit.max);
}

/** The value, or the fallback when it is not a number (NaN, Infinity): the engines' first guard. */
export function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

// What a form setter keeps from a typed number. An emptied field (null) stays empty.

/** Rounded to the cent, then bounded. */
export function cents(value: number, limit: Limit): number;
export function cents(value: number | null, limit: Limit): number | null;
export function cents(value: number | null, limit: Limit): number | null {
  return value === null ? null : clampTo(Math.round(value * 100) / 100, limit);
}

/** Rounded to a whole number (dollars, years, a count), then bounded. */
export function whole(value: number | null, limit: Limit): number | null {
  return value === null ? null : clampTo(Math.round(value), limit);
}

/** A typed percent, bounded and rounded to two decimals, as a rate: 2,5 gives 0,025. */
export function fromPercent(value: number, limit: Limit): number;
export function fromPercent(value: number | null, limit: Limit): number | null;
export function fromPercent(value: number | null, limit: Limit): number | null {
  return value === null ? null : Math.round(clampTo(value, limit) * 100) / 10_000;
}

/** A stored rate as the percent the field shows: 0,025 gives 2,5. */
export function toPercent(value: number | null): number | null {
  return value === null ? null : Math.round(value * 10_000) / 100;
}
