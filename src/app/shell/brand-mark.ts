import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A price tag in two halves: the two options every tool puts side by side, and what they cost.
 * Same shape as public/favicon.svg, but in the theme's colors.
 */
@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'brand-mark', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" focusable="false">
      <path class="left" fill-rule="evenodd" [attr.d]="left" />
      <path class="right" [attr.d]="right" />
    </svg>
  `,
})
export class BrandMark {
  readonly left = TAG_LEFT;
  readonly right = TAG_RIGHT;
}

/** The pointed half, with the string hole cut out so the background shows through. */
const TAG_LEFT =
  'M2.6 10.8 7.4 4.9Q8 4 9.2 4H14V20H9.2Q8 20 7.4 19.1L2.6 13.2Q1.8 12 2.6 10.8Z' +
  'M9.9 12A1.8 1.8 0 1 0 6.3 12 1.8 1.8 0 1 0 9.9 12Z';
const TAG_RIGHT = 'M14 4H20Q22 4 22 6V18Q22 20 20 20H14Z';
