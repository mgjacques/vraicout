import { FormulaParams, Money } from './money';

const moneyExact = new Intl.NumberFormat('fr-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const moneyRound = new Intl.NumberFormat('fr-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
});

const plain = new Intl.NumberFormat('fr-CA', {
  maximumFractionDigits: 2,
});

const tenths = new Intl.NumberFormat('fr-CA', {
  maximumFractionDigits: 1,
});

const MONEY_KEYS = new Set([
  'premiumMonthly',
  'premiumEntered',
  'depositMonthly',
  'grossDifference',
  'spentMonthly',
  'extraMonthly',
  'value',
  'leftValue',
  'rightValue',
  'face',
  'cash',
  'extra',
  'savings',
  'deposited',
  'beforeTax',
  'tax',
  'gain',
  'contributed',
  'nominal',
  'initial',
  'contribution',
  'balance',
  'noFee',
  'amount',
  'loan',
  'premium',
  'premium1',
  'premium2',
  'payout',
  'income',
  'total',
  'bill',
  'hourly',
  'price',
  'costs',
  'bracketTax',
  'basicAmount',
  'federalTax',
  'quebecTax',
  'taxBefore',
  'taxAfter',
  'incomeAfter',
]);

const PERCENT_KEYS = new Set([
  'annualReturnPercent',
  'reinvestPercent',
  'growthPercent',
  'ratePercent',
  'laterPercent',
  'inflationPercent',
  'grossPercent',
  'feePercent',
  'netPercent',
  'sharePercent',
  'taxSharePercent',
  'taxPercent',
  'bracketPercent',
  'lossPercent',
  'abatementPercent',
  'creditPercent',
  'federalPercent',
  'quebecPercent',
  'marginalPercent',
  'averagePercent',
]);

/** Durations, shown to one decimal as on the figure itself. */
const HOUR_KEYS = new Set(['hours', 'result']);

export function formatMoney(value: number): string {
  return moneyRound.format(Math.round(value));
}

export function formatMoneyExact(value: number): string {
  return moneyExact.format(value);
}

export function formatCount(value: number): string {
  return plain.format(value);
}

/** Hours or days to one decimal: « 60,4 ». */
export function formatHours(value: number): string {
  return tenths.format(value);
}

export function formatPercent(value: number): string {
  return `${plain.format(value)}\u00a0%`;
}

export function formatAge(value: number): string {
  return plain.format(value);
}

/** Fills a catalog template with the same operands the engine stored on the amount. */
export function explain(
  formulaId: string,
  params: FormulaParams,
  lookup: (key: string) => string | undefined,
): string {
  const template = lookup(formulaId);
  if (!template) return formulaId;
  const formatted = formatParams(params);
  return template.replace(/\{(\w+)\}/g, (_, token: string) => formatted[token] ?? '');
}

/** The amount's own sentence, then each further step (tax, today's dollars). */
export function explainMoney(amount: Money, lookup: (key: string) => string | undefined): string {
  return [
    explain(amount.formulaId, amount.params, lookup),
    ...(amount.steps ?? []).map((step) => explain(step.formulaId, step.params, lookup)),
  ].join(' ');
}

export function money(value: number, formulaId: string, params: FormulaParams): Money {
  return { value, formulaId, params: { ...params, value } };
}

function formatParams(params: FormulaParams): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (MONEY_KEYS.has(key)) formatted[key] = formatMoneyExact(value);
    else if (PERCENT_KEYS.has(key)) formatted[key] = formatPercent(value);
    else if (HOUR_KEYS.has(key)) formatted[key] = formatHours(value);
    else formatted[key] = formatCount(value);
  }
  return formatted;
}
