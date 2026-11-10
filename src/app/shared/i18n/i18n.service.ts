import { Injectable, computed, signal } from '@angular/core';
import { explain, explainMoney } from '../engine/formulas';
import { FormulaParams, Money } from '../engine/money';
import { en } from './en';
import { fr, MessageKey } from './fr';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<'fr' | 'en'>('fr');
  readonly messages = computed(() => (this.locale() === 'en' ? en : fr));

  t(key: MessageKey, params?: Record<string, string | number>): string {
    const raw = this.messages()[key] || fr[key];
    if (!params) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, token: string) => {
      const value = params[token];
      return value === undefined ? '' : String(value);
    });
  }

  explainMoney(amount: Money): string {
    return explainMoney(amount, (key) => this.lookup(key));
  }

  private lookup(key: string): string | undefined {
    const typed = key as MessageKey;
    return this.messages()[typed] || fr[typed];
  }

  explain(formulaId: string, params: FormulaParams): string {
    return explain(formulaId, params, (key) => {
      const typed = key as MessageKey;
      return this.messages()[typed] || fr[typed];
    });
  }
}
