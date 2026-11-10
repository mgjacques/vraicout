import { Injectable, signal } from '@angular/core';
import { Popover } from 'primeng/popover';

/**
 * One formula popover for the whole page. Every figure points it at itself,
 * so at most one formula is open and the page keeps a single overlay.
 */
@Injectable({ providedIn: 'root' })
export class FormulaService {
  readonly text = signal('');
  private popover: Popover | null = null;
  private pinned: HTMLElement | null = null;

  register(popover: Popover | null): void {
    this.popover = popover;
    this.pinned = null;
  }

  hover(target: HTMLElement, text: string): void {
    if (this.pinned) return;
    this.open(target, text);
  }

  leave(): void {
    if (!this.pinned) this.popover?.hide();
  }

  toggle(target: HTMLElement, text: string): void {
    if (this.pinned === target) {
      this.pinned = null;
      this.popover?.hide();
      return;
    }
    this.pinned = target;
    this.open(target, text);
  }

  hidden(): void {
    this.pinned = null;
  }

  private open(target: HTMLElement, text: string): void {
    const popover = this.popover;
    if (!popover) return;
    this.text.set(text);
    if (popover.overlayVisible()) {
      popover.target = target;
      requestAnimationFrame(() => popover.align());
      return;
    }
    popover.show(null, target);
  }
}
