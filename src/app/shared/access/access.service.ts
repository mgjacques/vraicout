import { Injectable, inject, signal } from '@angular/core';
import { loadSaved, save } from '../storage/device-storage';
import { ACCESS_GATE, ACCESS_PASSWORD_SHA256 } from './access.config';

const KEY = 'access';

/** Whether the app shows itself: remembered in this browser once the password is right. */
@Injectable({ providedIn: 'root' })
export class AccessService {
  readonly open = signal(!inject(ACCESS_GATE) || loadSaved<string>(KEY) === ACCESS_PASSWORD_SHA256);

  async unlock(password: string): Promise<boolean> {
    if ((await sha256(password)) !== ACCESS_PASSWORD_SHA256) return false;
    save(KEY, ACCESS_PASSWORD_SHA256);
    this.open.set(true);
    return true;
  }
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
