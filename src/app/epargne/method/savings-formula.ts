import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The savings compounding in MathML, as `projectSavings` runs it: the monthly rate, the balance
 * when deposits stop, then the years without deposits. Symbols are notation, not interface text.
 */
@Component({
  selector: 'app-savings-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './savings-formula.html',
})
export class SavingsFormula {}
