/**
 * What a field accepts. Wide on purpose: the bounds stop absurd projections, not real
 * situations. Every tool keeps its own in its `engine/limits.ts`; docs/limites-des-champs.md
 * lists them all, with the reason for each.
 */
export interface Limit {
  min: number;
  max: number;
}

export function clampTo(value: number, limit: Limit): number {
  return Math.min(limit.max, Math.max(limit.min, value));
}
