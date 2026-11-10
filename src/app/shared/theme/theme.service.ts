import { Injectable, signal } from '@angular/core';

/** Same key and class as the inline script in index.html, which applies them before the first paint. */
const STORAGE_KEY = 'vraicout.theme';
const DARK_CLASS = 'app-dark';

/** Light or dark. Light until the reader picks dark; the choice is kept on the device. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(initialDark());

  constructor() {
    apply(this.dark());
  }

  toggle(): void {
    const dark = !this.dark();
    apply(dark);
    this.dark.set(dark);
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      // Storage blocked: the choice lasts for this visit only.
    }
  }

  /** Shows a theme without keeping it, e.g. light while printing; `toggle` stays the reader's choice. */
  show(dark: boolean): void {
    apply(dark);
    this.dark.set(dark);
  }
}

function initialDark(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark';
  } catch {
    // Storage blocked: light.
    return false;
  }
}

/** The class goes on before the signal changes, so charts recomputing on it read the new colours. */
function apply(dark: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(DARK_CLASS, dark);
}
