import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ToolGroup } from '../../shared/tools';

/**
 * One group of tools in the header (« Au quotidien », « Épargne et assurances »). Like the avatar
 * menu, it opens on hover, and also on click or keyboard, since a phone has no hover.
 */
@Component({
  selector: 'app-tools-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './tools-menu.html',
  host: {
    class: 'tools-menu',
    '(pointerenter)': 'hover($event, true)',
    '(pointerleave)': 'hover($event, false)',
    '(keydown.escape)': 'open.set(false)',
    '(focusout)': 'closeIfOutside($event.relatedTarget)',
    '(document:click)': 'closeIfOutside($event.target)',
  },
})
export class ToolsMenu {
  readonly i18n = inject(I18nService);
  readonly group = input.required<ToolGroup>();
  readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly navigated = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
  );

  /** The trigger stays highlighted while one of its tools is open, as a plain link would. */
  readonly active = computed(() => {
    this.navigated();
    return this.group().tools.some((tool) =>
      this.router.isActive(tool.path, {
        paths: 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      }),
    );
  });

  /** Mouse only: a tap also sends pointer events, and would open then close the menu at once. */
  hover(event: PointerEvent, inside: boolean): void {
    if (event.pointerType === 'mouse') this.open.set(inside);
  }

  /** With a mouse, hovering already opened it: a click must not close it again under the pointer. */
  toggle(event: MouseEvent): void {
    this.open.set((event as PointerEvent).pointerType === 'mouse' || !this.open());
  }

  closeIfOutside(target: EventTarget | null): void {
    if (!(target instanceof Node) || !this.host.nativeElement.contains(target))
      this.open.set(false);
  }
}
