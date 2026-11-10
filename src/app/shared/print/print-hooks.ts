/** Work around printing for code the shell must not import, such as Chart.js, which loads with the tools. */
export interface PrintHook {
  /** Before the page switches to light. */
  before(): void;
  /** Once the reader's theme is back. */
  after(): void;
}

export const printHooks = new Set<PrintHook>();
