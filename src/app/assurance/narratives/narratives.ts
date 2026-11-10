import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Message } from 'primeng/message';
import { formatAge, formatMoney, formatPercent } from '../../shared/engine/formulas';
import { strategy } from '../engine/project';
import { I18nService } from '../../shared/i18n/i18n.service';
import { RichText } from '../../shared/rich-text/rich-text';
import { ScenarioStore } from '../state/scenario.store';

@Component({
  selector: 'app-narratives',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, Message],
  templateUrl: './narratives.html',
})
export class Narratives {
  readonly store = inject(ScenarioStore);
  readonly i18n = inject(I18nService);

  readonly facts = computed(() => {
    const projection = this.store.projection();
    const opening = projection.years[0];
    const keep = opening ? strategy(opening.strategies, 'keep') : null;
    const term = opening ? strategy(opening.strategies, 'termInvest') : null;
    return {
      face: formatMoney(keep?.deathBenefit.value ?? 0),
      paidUpAge: formatAge(projection.paidUpAge),
      termYears: formatAge(projection.assumptions.termYears),
      termFace: formatMoney(term?.deathBenefit.value ?? 0),
      termEndAge: formatAge(projection.termEndAge),
      reinvest: formatPercent(projection.assumptions.reinvestShare * 100),
      growth: projection.assumptions.projectedGrowth > 0,
      paidUpDone: projection.assumptions.premiumMonths === 0,
      cashScale: projection.assumptions.cashScale,
    };
  });

  /** How far the invested money would replace the term's payout once the term ends. */
  readonly afterTerm = computed(() => {
    const projection = this.store.projection();
    const { assumptions } = projection;
    const end = projection.milestones.find((item) => item.kinds.includes('termEnd'));
    const face = this.store.input().term.deathBenefit;
    if (!end || face <= 0) return null;
    const savings = strategy(end.strategies, 'termInvest').alive.value;
    // Compare in the units shown: in today's dollars, the face is discounted too.
    const faceThen = assumptions.realDollars
      ? face * Math.pow(1 + assumptions.inflation, -end.month / 12)
      : face;
    return this.i18n.t(assumptions.realDollars ? 'after.ratioReal' : 'after.ratio', {
      termEndAge: formatAge(projection.termEndAge),
      amount: formatMoney(savings),
      percent: formatPercent(Math.round((savings / faceThen) * 100)),
      face: formatMoney(face),
      faceToday: formatMoney(faceThen),
    });
  });
}
