import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../shared/i18n/i18n.service';
import { ThemeService } from '../shared/theme/theme.service';

/** The moon or the sun: in the header on a wide screen, in the menu panel on a narrow one. */
@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<button
    type="button"
    class="theme-toggle"
    (click)="theme.toggle()"
    [attr.aria-label]="label()"
    [attr.title]="label()"
  >
    <i
      class="pi"
      [class.pi-moon]="!theme.dark()"
      [class.pi-sun]="theme.dark()"
      aria-hidden="true"
    ></i>
  </button>`,
})
export class ThemeToggle {
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);
  /** Names what the button does, not the current state. */
  readonly label = computed(() =>
    this.i18n.t(this.theme.dark() ? 'shell.themeLight' : 'shell.themeDark'),
  );
}
