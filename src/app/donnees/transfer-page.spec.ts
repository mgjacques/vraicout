import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { fr } from '../shared/i18n/fr';
import { exportCode, readKept } from '../shared/storage/data-transfer';
import { TransferPage } from './transfer-page';

async function render(query: Record<string, string> = {}) {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(query) } },
      },
    ],
  });
  const fixture = TestBed.createComponent(TransferPage);
  await fixture.whenStable();
  return { fixture, page: fixture.nativeElement as HTMLElement };
}

function paste(page: HTMLElement, value: string): void {
  const field = page.querySelector<HTMLTextAreaElement>('#transfer-import')!;
  field.value = value;
  field.dispatchEvent(new Event('input'));
}

describe('TransferPage', () => {
  afterEach(() => localStorage.clear());

  it('says there is nothing to export in a browser that keeps nothing', async () => {
    const { page } = await render();
    expect(page.querySelector('#transfer-export')).toBeNull();
    expect(page.textContent).toContain(fr['transfer.export.empty']);
  });

  it('shows the code of what this browser keeps', async () => {
    localStorage.setItem('vraicout.theme', 'dark');
    const { page } = await render();
    const field = page.querySelector<HTMLTextAreaElement>('#transfer-export')!;
    expect(field.readOnly).toBe(true);
    expect(field.value).toBe(exportCode());
  });

  it('refuses a code it did not make, without touching what is kept', async () => {
    localStorage.setItem('vraicout.theme', 'dark');
    const { fixture, page } = await render();
    paste(page, 'pas un code');
    await fixture.whenStable();
    fixture.componentInstance.askImport();
    await fixture.whenStable();

    expect(page.querySelector('.transfer-error')?.textContent).toContain(
      fr['transfer.import.invalid'],
    );
    expect(fixture.componentInstance.confirming()).toBe(false);
    expect(readKept()).toEqual({ theme: 'dark' });
  });

  it('asks before replacing the kept figures with a valid code', async () => {
    localStorage.setItem('vraicout.theme', 'dark');
    const code = exportCode();
    localStorage.clear();
    const { fixture, page } = await render();
    paste(page, code);
    fixture.componentInstance.askImport();
    await fixture.whenStable();

    expect(fixture.componentInstance.confirming()).toBe(true);
    expect(readKept()).toEqual({});
  });

  it('says the import worked after the reload', async () => {
    const { page } = await render({ importe: '' });
    expect(page.querySelector('.transfer-done')?.textContent).toContain(fr['transfer.import.done']);
  });
});
