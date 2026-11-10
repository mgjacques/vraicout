import { BreakpointObserver } from '@angular/cdk/layout';
import { ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { APP_NAME } from '../shared/app-name';
import { I18nService } from '../shared/i18n/i18n.service';
import { PrintDialog } from '../shared/print/print-dialog';
import { PrintService } from '../shared/print/print.service';
import { ABOUT_ANCHOR, goToAbout } from './about-link';
import { BrandMark } from './brand-mark';
import { DataMenu } from './data-menu/data-menu';
import { MobileMenu } from './mobile-menu/mobile-menu';
import { SupportLink } from './support-link';
import { ThemeToggle } from './theme-toggle';
import { TOOL_GROUPS } from '../shared/tools';
import { ToolsMenu } from './tools-menu/tools-menu';

/** Below this, the tool links no longer fit on one line: they move behind the hamburger. */
const COMPACT = '(max-width: 1099px)';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    BrandMark,
    DataMenu,
    MobileMenu,
    PrintDialog,
    SupportLink,
    ThemeToggle,
    ToolsMenu,
  ],
  templateUrl: './shell.html',
})
export class Shell {
  readonly i18n = inject(I18nService);
  readonly appName = APP_NAME;
  readonly groups = TOOL_GROUPS;
  readonly aboutAnchor = ABOUT_ANCHOR;
  private readonly router = inject(Router);
  /** Created with the shell so Ctrl+P also prints on white. */
  readonly printer = inject(PrintService);
  readonly menuOpen = signal(false);
  readonly compact = toSignal(
    inject(BreakpointObserver)
      .observe(COMPACT)
      .pipe(map((result) => result.matches)),
    {
      initialValue:
        typeof globalThis.matchMedia === 'function' && globalThis.matchMedia(COMPACT).matches,
    },
  );

  goToAbout(event: MouseEvent): void {
    goToAbout(event, this.router);
  }

  constructor() {
    // The header sticks to the top: what sticks below it (the parameters column, scrolled-to
    // sections) reads its height from --app-bar-h.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    // The router's scroll to an anchor (/#a-propos) ignores scroll-padding-top: same gap here.
    inject(ViewportScroller).setOffset(() => [0, host.offsetHeight + 12]);
    afterNextRender(() => {
      if (typeof ResizeObserver !== 'function') return;
      const root = document.documentElement;
      const observer = new ResizeObserver(() =>
        root.style.setProperty('--app-bar-h', `${host.offsetHeight}px`),
      );
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
