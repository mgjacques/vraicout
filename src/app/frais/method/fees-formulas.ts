import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The fees compounding in MathML, as `projectFees` runs it: the monthly return, the monthly share
 * of the fees, then the balance month by month. Symbols are notation, not interface text.
 */
@Component({
  selector: 'app-fees-growth-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fees-growth-formula.html',
})
export class FeesGrowthFormula {}

/** The retirement withdrawal in MathML, as `firstWithdrawal` runs it, then each month's raise. */
@Component({
  selector: 'app-fees-drawdown-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fees-drawdown-formula.html',
})
export class FeesDrawdownFormula {}
