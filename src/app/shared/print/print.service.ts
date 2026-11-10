import { ApplicationRef, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { MessageKey } from '../i18n/fr';
import { loadSaved, save } from '../storage/device-storage';
import { ThemeService } from '../theme/theme.service';
import { printHooks } from './print-hooks';

/** A part of the page the reader can leave out; the element carries `data-print="<id>"`. */
export interface PrintSection {
  id: string;
  label: MessageKey;
}

const OMIT_CLASS = 'print-omit';

/**
 * Printing goes through the browser (the `@media print` rules in styles.css). The button
 * opens a dialog to pick the sections; Ctrl+P prints the whole page. `open()` is the one
 * entry point for the button: a future paywall check belongs there.
 */
@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly theme = inject(ThemeService);
  private readonly appRef = inject(ApplicationRef);
  /** The reader's theme while a dark page prints on white. */
  private restoreDark = false;
  private page: string | null = null;
  readonly sections = signal<PrintSection[]>([]);
  readonly dialogOpen = signal(false);

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('beforeprint', () => this.before());
    window.addEventListener('afterprint', () => this.after());
  }

  /** Called by a page: its sections are offered until the page is destroyed. */
  use(page: string, sections: PrintSection[], destroyRef: DestroyRef): void {
    this.page = page;
    this.sections.set(sections);
    destroyRef.onDestroy(() => {
      if (this.page !== page) return;
      this.page = null;
      this.sections.set([]);
      this.dialogOpen.set(false);
    });
  }

  open(): void {
    this.dialogOpen.set(true);
  }

  /** Sections left out last time on this page. Kept rather than the chosen ones, so a new section starts ticked. */
  omitted(): string[] {
    return this.page ? (loadSaved<string[]>(key(this.page)) ?? []) : [];
  }

  /** Remembers the choice, then prints once the dialog is gone. */
  printWithout(omit: string[]): void {
    if (this.page) save(key(this.page), omit);
    this.dialogOpen.set(false);
    for (const id of omit) {
      document.querySelectorAll(`[data-print="${CSS.escape(id)}"]`).forEach((element) => {
        element.classList.add(OMIT_CLASS);
      });
    }
    // Let the dialog and its mask leave the page before the browser takes its snapshot.
    setTimeout(() => window.print(), 250);
  }

  /** Paper is white. The browser lays the page out right after this handler, so render now. */
  private before(): void {
    for (const hook of printHooks) hook.before();
    if (this.theme.dark()) {
      this.restoreDark = true;
      this.theme.show(false);
      this.appRef.tick();
    }
  }

  private after(): void {
    if (this.restoreDark) {
      this.restoreDark = false;
      this.theme.show(true);
      this.appRef.tick();
    }
    for (const hook of printHooks) hook.after();
    document.querySelectorAll(`.${OMIT_CLASS}`).forEach((element) => {
      element.classList.remove(OMIT_CLASS);
    });
  }
}

function key(page: string): string {
  return `print.${page}`;
}
