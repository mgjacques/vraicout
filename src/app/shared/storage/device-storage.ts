/**
 * What the app keeps between visits: in this browser only, never sent anywhere.
 * Every key starts with PREFIX, so clearing the prefix clears everything
 * (the theme choice from ThemeService included).
 */
export const PREFIX = 'vraicout.';

/** Bump when a saved shape changes: older saves are then ignored rather than misread. */
const VERSION = 1;

interface Envelope<T> {
  v: number;
  data: T;
}

export function loadSaved<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Envelope<T>;
    return saved.v === VERSION ? saved.data : null;
  } catch {
    // Storage blocked or unreadable: start fresh.
    return null;
  }
}

export function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ v: VERSION, data } satisfies Envelope<T>));
  } catch {
    // Storage blocked or full: the figures last for this visit only.
  }
}

export function clearSaved(): void {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage blocked: nothing was kept.
  }
}
