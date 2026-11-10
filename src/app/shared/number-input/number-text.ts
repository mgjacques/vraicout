/**
 * The number in a typed or pasted text, or null when there is none. The last comma or
 * period is the decimal sign, so `12.50`, `12,50` and `1 234,56 $` all read as expected;
 * any earlier one, or one followed by exactly three digits (`1,000`), separates thousands.
 */
export function parseNumber(text: string, maxFractionDigits = 2): number | null {
  const kept = text.replace(/[^\d.,]/g, '');
  if (!/\d/.test(kept)) return null;
  let sign = Math.max(kept.lastIndexOf(','), kept.lastIndexOf('.'));
  if (sign >= 0 && maxFractionDigits < 3 && /^\d{3}$/.test(kept.slice(sign + 1))) sign = -1;
  const whole = (sign < 0 ? kept : kept.slice(0, sign)).replace(/[.,]/g, '');
  const fraction = sign < 0 ? '' : kept.slice(sign + 1);
  const value = Number(`${whole || '0'}.${fraction || '0'}`);
  const scale = 10 ** maxFractionDigits;
  return Math.round(value * scale) / scale;
}

/** While typing: the bare number, `1000,5`, with nothing to step around. */
export function numberDraft(value: number | null, maxFractionDigits = 2): string {
  if (value === null) return '';
  return new Intl.NumberFormat('fr-CA', {
    useGrouping: false,
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}
