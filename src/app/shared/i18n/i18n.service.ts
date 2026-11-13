import { Injectable } from '@angular/core';
import { explain, explainMoney } from '../engine/formulas';
import { FormulaParams, Money } from '../engine/money';
import { loadedMessages } from './catalogs';
import type { MessageKey } from './fr';

/**
 * Reads the texts loaded so far (`catalogs.ts`): the shared ones from the start, each tool's
 * once its route has loaded. A key whose catalog is not loaded comes back as the key itself.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly messages = loadedMessages.asReadonly();

  t(key: MessageKey, params?: Record<string, string | number>): string {
    const raw = this.messages()[key] ?? key;
    if (!params) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, token: string) => {
      const value = params[token];
      return value === undefined ? '' : String(value);
    });
  }

  explainMoney(amount: Money): string {
    return explainMoney(amount, (key) => this.lookup(key));
  }

  explain(formulaId: string, params: FormulaParams): string {
    return explain(formulaId, params, (key) => this.lookup(key));
  }

  private lookup(key: string): string | undefined {
    return this.messages()[key as MessageKey];
  }
}
