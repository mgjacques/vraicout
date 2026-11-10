/** Where the invested money sits: it decides the tax on what you could take out. */
export type Account = 'tfsa' | 'rrsp' | 'taxable';

export type FormulaParams = Record<string, number>;

export interface Money {
  value: number;
  formulaId: string;
  params: FormulaParams;
  /** Further sentences of the explanation, in order: tax, then the conversion to today's dollars. */
  steps?: FormulaStep[];
}

export interface FormulaStep {
  formulaId: string;
  params: FormulaParams;
}
