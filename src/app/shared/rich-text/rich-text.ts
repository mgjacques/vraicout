import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface Segment {
  text: string;
  style: 'bold' | 'italic' | null;
}

/** Pieces of a catalog text: `**…**` in bold, `*…*` in italics. */
export function segments(text: string): Segment[] {
  const pieces: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(/\*\*(.+?)\*\*|\*(.+?)\*/g)) {
    if (match.index > last) pieces.push({ text: text.slice(last, match.index), style: null });
    pieces.push(
      match[1] !== undefined
        ? { text: match[1], style: 'bold' }
        : { text: match[2], style: 'italic' },
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) pieces.push({ text: text.slice(last), style: null });
  return pieces;
}

/** A catalog text with its `**…**` passages in bold and `*…*` in italics. No innerHTML: parameters such as names come from the user. */
@Component({
  selector: 'app-rich-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  // On one line: whitespace around a piece would show before the punctuation that follows it.
  // prettier-ignore
  template: `@for (piece of pieces(); track $index) {@switch (piece.style) {@case ('bold') {<strong>{{ piece.text }}</strong>} @case ('italic') {<em>{{ piece.text }}</em>} @default {{{ piece.text }}}}}`,
})
export class RichText {
  readonly text = input.required<string>();
  readonly pieces = computed(() => segments(this.text()));
}
