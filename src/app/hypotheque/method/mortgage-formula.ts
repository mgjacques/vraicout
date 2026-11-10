import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The mortgage payment in MathML, as `projectMortgage` runs it: the Canadian monthly rate, the
 * level payment, then the balance month by month. Symbols are notation, not interface text.
 */
@Component({
  selector: 'app-mortgage-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mortgage-formula.html',
})
export class MortgageFormula {}
