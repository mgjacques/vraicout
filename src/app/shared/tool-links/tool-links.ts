import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../i18n/i18n.service';

/**
 * Under a tool's title: its introduction, for the tools that have one and skip it once the
 * results exist, and its « Détails et sources » page, near the figures it explains.
 */
@Component({
  selector: 'app-tool-links',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="tool-links print-omit" [attr.aria-label]="i18n.t('toolLinks.label')">
      @if (intro(); as introPath) {
        <a [routerLink]="introPath"
          ><i class="pi pi-book" aria-hidden="true"></i
          ><span>{{ i18n.t('toolLinks.intro') }}</span></a
        >
      }
      <a [routerLink]="method()"
        ><i class="pi pi-calculator" aria-hidden="true"></i
        ><span>{{ i18n.t('method.title') }}</span></a
      >
    </nav>
  `,
})
export class ToolLinks {
  readonly i18n = inject(I18nService);
  /** The tool's /methode page. */
  readonly method = input.required<string>();
  /** The tool's introduction, reachable even when its guard would skip it. */
  readonly intro = input<string>();
}
