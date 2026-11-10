import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { Popover } from 'primeng/popover';
import { FormulaService } from './formula.service';

@Component({
  selector: 'app-formula-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Popover],
  template: `
    <p-popover
      (onHide)="formulas.hidden()"
      [dismissable]="true"
      appendTo="body"
      styleClass="formula-pop"
    >
      <p>{{ formulas.text() }}</p>
    </p-popover>
  `,
})
export class FormulaPopover implements OnDestroy {
  readonly formulas = inject(FormulaService);
  private readonly popover = viewChild.required(Popover);

  constructor() {
    afterNextRender(() => this.formulas.register(this.popover()));
  }

  ngOnDestroy(): void {
    this.formulas.register(null);
  }
}
