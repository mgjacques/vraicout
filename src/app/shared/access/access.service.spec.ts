import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { loadSaved, save } from '../storage/device-storage';
import { ACCESS_GATE, ACCESS_PASSWORD_SHA256 } from './access.config';
import { AccessService } from './access.service';

describe('AccessService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [{ provide: ACCESS_GATE, useValue: true }] });
  });

  it('stays closed on a wrong password', async () => {
    const access = TestBed.inject(AccessService);
    expect(access.open()).toBe(false);
    expect(await access.unlock('pas le bon')).toBe(false);
    expect(access.open()).toBe(false);
    expect(loadSaved('access')).toBeNull();
  });

  it('remembers a password it once accepted', () => {
    save('access', ACCESS_PASSWORD_SHA256);
    expect(TestBed.inject(AccessService).open()).toBe(true);
  });

  it('asks again once the password has changed', () => {
    save('access', 'un ancien hash');
    expect(TestBed.inject(AccessService).open()).toBe(false);
  });

  it('opens without asking while the screen is off', () => {
    TestBed.overrideProvider(ACCESS_GATE, { useValue: false });
    expect(TestBed.inject(AccessService).open()).toBe(true);
  });
});
