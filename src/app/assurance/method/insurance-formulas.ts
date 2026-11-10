import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The invested money in MathML, as `project` runs it: the monthly rate, then each side's pocket
 * month by month. Symbols are notation, not interface text.
 */
@Component({
  selector: 'app-insurance-growth-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insurance-growth-formula.html',
})
export class InsuranceGrowthFormula {}

/** The cash value between two lines of the contract, as `interpolate` runs it (exponential case). */
@Component({
  selector: 'app-insurance-cash-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insurance-cash-formula.html',
})
export class InsuranceCashFormula {}

/** The money in hand after withdrawing everything, as `afterTax` runs it: RRSP, then taxable. */
@Component({
  selector: 'app-insurance-tax-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './insurance-tax-formula.html',
})
export class InsuranceTaxFormula {}
