import { fr, type MessageKey } from './fr';

/** Phase 2 fills these strings. Keys mirror the French catalog. */
export const en: Record<MessageKey, string> = Object.fromEntries(
  (Object.keys(fr) as MessageKey[]).map((key) => [key, '']),
) as Record<MessageKey, string>;
