import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ClearDataDialog } from '../clear-data/clear-data-dialog';

/**
 * The avatar at the right of the header. Its menu opens on hover, and also on click
 * or keyboard, since a phone has no hover.
 */
@Component({
  selector: 'app-data-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, RouterLink, ClearDataDialog],
  templateUrl: './data-menu.html',
  host: {
    class: 'data-menu',
    '(pointerenter)': 'hover($event, true)',
    '(pointerleave)': 'hover($event, false)',
    '(keydown.escape)': 'open.set(false)',
    '(focusout)': 'closeIfOutside($event.relatedTarget)',
    '(document:click)': 'closeIfOutside($event.target)',
  },
})
export class DataMenu {
  readonly i18n = inject(I18nService);
  readonly open = signal(false);
  readonly confirming = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Mouse only: a tap also sends pointer events, and would open then close the menu at once. */
  hover(event: PointerEvent, inside: boolean): void {
    if (event.pointerType === 'mouse') this.open.set(inside);
  }

  closeIfOutside(target: EventTarget | null): void {
    if (!(target instanceof Node) || !this.host.nativeElement.contains(target))
      this.open.set(false);
  }

  askClear(): void {
    this.open.set(false);
    this.confirming.set(true);
  }
}
