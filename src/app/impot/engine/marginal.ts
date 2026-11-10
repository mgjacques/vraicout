import { money } from '../../shared/engine/formulas';
import { FormulaParams, Money } from '../../shared/engine/money';
import {
  bracketRate,
  bracketTax,
  FEDERAL_BRACKETS,
  FEDERAL_CREDIT_RATE,
  federalBasicAmount,
  federalCreditLoss,
  QUEBEC_ABATEMENT,
  QUEBEC_BASIC_AMOUNT,
  QUEBEC_BRACKETS,
  QUEBEC_CREDIT_RATE,
  rateThresholds,
} from './brackets';
import { LevelTax, MarginalInput, MarginalResult, RateStep } from './types';

/** The chart's last income: past the top bracket, the rate no longer changes. */
export const CHART_MAX = 300_000;

/**
 * The marginal rate on the next dollar of taxable income, federal and Québec, with the tax of
 * the year and, when the person adds an income, what it costs in tax. Income tax only.
 */
export function marginalRate(input: MarginalInput): MarginalResult {
  const { income } = input;
  const federal = federalLevel(income);
  const quebec = quebecLevel(income);

  const marginalValue = federal.rate.value + quebec.rate.value;
  const marginal = percent(marginalValue, 'formula.marginal.marginal', {
    federalPercent: federal.rate.value,
    quebecPercent: quebec.rate.value,
    marginalPercent: marginalValue,
  });

  const totalValue = federal.tax.value + quebec.tax.value;
  const total = money(totalValue, 'formula.marginal.total', {
    federalTax: federal.tax.value,
    quebecTax: quebec.tax.value,
  });

  const averageValue = income > 0 ? (totalValue / income) * 100 : 0;
  const average = percent(
    averageValue,
    income > 0 ? 'formula.marginal.average' : 'formula.marginal.average.zero',
    { tax: totalValue, income, averagePercent: averageValue },
  );

  return {
    input,
    federal,
    quebec,
    marginal,
    total,
    average,
    extra: input.extra > 0 ? extraIncome(income, input.extra, totalValue) : null,
    steps: rateSteps(),
  };
}

/** Federal and Québec tax for the year, after credits and the abatement. */
export function totalTax(income: number): number {
  return federalLevel(income).tax.value + quebecLevel(income).tax.value;
}

function federalLevel(income: number): LevelTax {
  const basicAmount = federalBasicAmount(income);
  const brackets = bracketTax(income, FEDERAL_BRACKETS);
  const credit = FEDERAL_CREDIT_RATE * basicAmount;
  const taxed = brackets >= credit;
  const shared = {
    income,
    basicAmount,
    bracketTax: brackets,
    creditPercent: FEDERAL_CREDIT_RATE * 100,
    abatementPercent: QUEBEC_ABATEMENT * 100,
  };

  const bracket = bracketRate(income, FEDERAL_BRACKETS);
  const loss = federalCreditLoss(income);
  const rateValue = taxed ? (bracket + loss) * (1 - QUEBEC_ABATEMENT) * 100 : 0;
  const rateParams = {
    ...shared,
    bracketPercent: bracket * 100,
    lossPercent: loss * 100,
    federalPercent: rateValue,
  };
  const rate = percent(
    rateValue,
    !taxed
      ? 'formula.marginal.federalRate.zero'
      : loss > 0
        ? 'formula.marginal.federalRate.phase'
        : 'formula.marginal.federalRate',
    rateParams,
  );

  const taxValue = Math.max(0, brackets - credit) * (1 - QUEBEC_ABATEMENT);
  const tax = money(
    taxValue,
    taxed ? 'formula.marginal.federalTax' : 'formula.marginal.federalTax.zero',
    shared,
  );
  return { rate, tax };
}

function quebecLevel(income: number): LevelTax {
  const brackets = bracketTax(income, QUEBEC_BRACKETS);
  const credit = QUEBEC_CREDIT_RATE * QUEBEC_BASIC_AMOUNT;
  const taxed = brackets >= credit;
  const shared = {
    income,
    basicAmount: QUEBEC_BASIC_AMOUNT,
    bracketTax: brackets,
    creditPercent: QUEBEC_CREDIT_RATE * 100,
  };

  const rateValue = taxed ? bracketRate(income, QUEBEC_BRACKETS) * 100 : 0;
  const rate = percent(
    rateValue,
    taxed ? 'formula.marginal.quebecRate' : 'formula.marginal.quebecRate.zero',
    { ...shared, quebecPercent: rateValue },
  );

  const tax = money(
    Math.max(0, brackets - credit),
    taxed ? 'formula.marginal.quebecTax' : 'formula.marginal.quebecTax.zero',
    shared,
  );
  return { rate, tax };
}

function extraIncome(
  income: number,
  amount: number,
  taxBefore: number,
): NonNullable<MarginalResult['extra']> {
  const incomeAfter = income + amount;
  const taxAfter = totalTax(incomeAfter);
  const taxValue = taxAfter - taxBefore;
  const tax = money(taxValue, 'formula.marginal.extra.tax', {
    income,
    incomeAfter,
    taxBefore,
    taxAfter,
  });
  const kept = money(amount - taxValue, 'formula.marginal.extra.kept', {
    amount,
    tax: taxValue,
  });
  const rateValue = (taxValue / amount) * 100;
  const rate = percent(rateValue, 'formula.marginal.extra.rate', {
    tax: taxValue,
    amount,
    ratePercent: rateValue,
  });
  return { tax, kept, rate };
}

/** The combined rate from each threshold up to the next, computed as for an entered income. */
function rateSteps(): RateStep[] {
  return rateThresholds()
    .filter((from) => from < CHART_MAX)
    .map((from) => {
      const federalPercent = federalLevel(from).rate.value;
      const quebecPercent = quebecLevel(from).rate.value;
      return { from, federalPercent, quebecPercent, percent: federalPercent + quebecPercent };
    });
}

/** A rate in percent: `value` is not a dollar amount, so the sentence names it by a percent key. */
function percent(value: number, formulaId: string, params: FormulaParams): Money {
  return { value, formulaId, params };
}
