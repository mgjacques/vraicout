/**
 * « Exporter ou importer vos données »: everything the app keeps, as one text code the reader
 * copies and pastes into another browser. The code is base64 of a small JSON object: it is
 * readable by anyone who has it, not encrypted. Nothing here touches the network.
 */
import { PREFIX } from './device-storage';

/** Changes only if the code's own shape changes; each saved value keeps its own version inside. */
const FORMAT = 1;
const APP = 'vraicout';

/**
 * Not carried over: the pre-launch password check. A code passed to someone else would
 * otherwise open the site for them.
 */
const LOCAL_ONLY = new Set(['access']);

interface Payload {
  app: typeof APP;
  v: number;
  /** Saved values as stored, keyed without the prefix. */
  keys: Record<string, string>;
}

/** The kept values, keyed without the prefix. Empty if nothing is kept or storage is blocked. */
export function readKept(storage: Storage = localStorage): Record<string, string> {
  const kept: Record<string, string> = {};
  try {
    for (let i = 0; i < storage.length; i++) {
      const full = storage.key(i);
      if (!full?.startsWith(PREFIX)) continue;
      const key = full.slice(PREFIX.length);
      const value = storage.getItem(full);
      if (!LOCAL_ONLY.has(key) && value !== null) kept[key] = value;
    }
  } catch {
    // Storage blocked: nothing to export.
  }
  return kept;
}

/** The code to copy, or '' when there is nothing to export. Keys are sorted: same data, same code. */
export function exportCode(storage: Storage = localStorage): string {
  const kept = readKept(storage);
  const names = Object.keys(kept).sort();
  if (names.length === 0) return '';
  const keys = Object.fromEntries(names.map((name) => [name, kept[name]]));
  return toBase64(JSON.stringify({ app: APP, v: FORMAT, keys } satisfies Payload));
}

/** The values a pasted code holds, or null if it is not a code this site made. */
export function readCode(code: string): Record<string, string> | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64(code.replace(/\s+/g, '')));
    if (!isPayload(parsed)) return null;
    const entries = Object.entries(parsed.keys).filter(([key]) => !LOCAL_ONLY.has(key));
    return entries.length > 0 ? Object.fromEntries(entries) : null;
  } catch {
    // Not base64, not JSON: not a code.
    return null;
  }
}

/**
 * Replaces what is kept with the code's values: whatever the code does not hold is forgotten,
 * so the browser ends up with exactly the exported data. False if storage refused it.
 */
export function applyCode(
  values: Record<string, string>,
  storage: Storage = localStorage,
): boolean {
  try {
    Object.keys(readKept(storage)).forEach((key) => storage.removeItem(PREFIX + key));
    Object.entries(values).forEach(([key, value]) => storage.setItem(PREFIX + key, value));
    return true;
  } catch {
    // Storage blocked or full.
    return false;
  }
}

function isPayload(value: unknown): value is Payload {
  if (typeof value !== 'object' || value === null) return false;
  const { app, v, keys } = value as Partial<Payload>;
  return (
    app === APP &&
    v === FORMAT &&
    typeof keys === 'object' &&
    keys !== null &&
    !Array.isArray(keys) &&
    Object.entries(keys).every(([key, val]) => key.length > 0 && typeof val === 'string')
  );
}

/** btoa alone refuses accents (a first name like « Zoé »): go through UTF-8 bytes. */
function toBase64(text: string): string {
  let binary = '';
  new TextEncoder().encode(text).forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function fromBase64(code: string): string {
  const bytes = Uint8Array.from(atob(code), (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
