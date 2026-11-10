import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrintService } from './print.service';

describe('PrintService', () => {
  let destroy: () => void;
  const destroyRef = {
    onDestroy: (callback: () => void) => {
      destroy = callback;
      return () => undefined;
    },
  } as DestroyRef;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.spyOn(window, 'print').mockImplementation(() => undefined);
    document.body.innerHTML =
      '<section data-print="chart"></section><section data-print="table"></section>';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('leaves out the unticked sections, then puts them back after printing', () => {
    const printer = TestBed.inject(PrintService);
    printer.use('frais', [], destroyRef);
    printer.open();

    printer.printWithout(['table']);
    expect(printer.dialogOpen()).toBe(false);
    vi.runAllTimers();
    expect(window.print).toHaveBeenCalled();
    expect(document.querySelector('[data-print="table"]')!.classList).toContain('print-omit');
    expect(document.querySelector('[data-print="chart"]')!.classList).not.toContain('print-omit');

    window.dispatchEvent(new Event('afterprint'));
    expect(document.querySelectorAll('.print-omit').length).toBe(0);
  });

  it('remembers the choice per page, on the device', () => {
    const printer = TestBed.inject(PrintService);
    printer.use('frais', [], destroyRef);
    printer.printWithout(['table']);
    expect(printer.omitted()).toEqual(['table']);

    destroy();
    expect(printer.omitted()).toEqual([]);
    printer.use('assurance', [], destroyRef);
    expect(printer.omitted()).toEqual([]);
    printer.use('frais', [], destroyRef);
    expect(printer.omitted()).toEqual(['table']);
  });
});
