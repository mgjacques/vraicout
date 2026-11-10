import { InjectionToken } from '@angular/core';

/**
 * The password screen in front of the whole app, while it is online but not public.
 * A barrier for the curious and the search engines, not real security: the check
 * runs in the browser, so anyone reading the bundle can get past it.
 */

/** Off: the app opens for everyone. Replace with true to put the screen back. */
export const ACCESS_GATE_ENABLED = false;

/** Whether the screen shows; the tests turn it on to check the screen itself. */
export const ACCESS_GATE = new InjectionToken<boolean>('ACCESS_GATE', {
  factory: () => ACCESS_GATE_ENABLED,
});

/**
 * SHA-256 (hex) of the password, never the password itself. A new one:
 *   printf '%s' 'le mot de passe' | sha256sum
 * Changing it asks everyone for the new password.
 */
export const ACCESS_PASSWORD_SHA256 =
  'feff628290d07a603a25612da5f47b12b79b666286942785d39651ee43f46dc3';
