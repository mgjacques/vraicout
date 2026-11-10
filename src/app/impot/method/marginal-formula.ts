import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The marginal rate and the tax of each level in MathML, as `marginalRate` runs them: the rate on
 * the next dollar, then the federal and Québec tax. Symbols are notation, not interface text.
 */
@Component({
  selector: 'app-marginal-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './marginal-formula.html',
})
export class MarginalFormula {}
