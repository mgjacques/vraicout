import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { formatAge, formatMoney, formatPercent } from '../../shared/engine/formulas';
import { breakEvenReturn, strategy } from '../engine/project';
import { MilestoneKind, StrategyId } from '../engine/types';
import { Figure } from '../../shared/figure/figure';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ScenarioStore } from '../state/scenario.store';

/** How far apart the two options are on one line, or that they are about even. */
export interface Gap {
  ahead: StrategyId | null;
  text: string;
}

/**
 * The two options at one age: an age field with the milestones as shortcuts, then one table
 * that sets each figure against its counterpart, then what to keep in mind. The figures are
 * the engine's totals, the same ones the charts and the year-by-year table show.
 */
@Component({
  selector: 'app-milestone-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Figure, FormsModule, InputNumber],
  templateUrl: './milestone-cards.html',
})
export class MilestoneCards {
  readonly store = inject(ScenarioStore);
  readonly i18n = inject(I18nService);

  readonly focus = this.store.focus;
  readonly minAge = computed(() => this.store.projection().currentAge);
  readonly maxAge = computed(() => Math.floor(this.store.projection().horizonAge));

  readonly shortcuts = computed(() =>
    this.store.projection().milestones.map((item) => ({
      age: item.age,
      label: this.shortcutLabel(item.kinds, item.age),
    })),
  );

  /** What the milestone at the chosen age means, if the age is one. */
  readonly detail = computed(() => {
    const milestone = this.store
      .projection()
      .milestones.find((item) => item.age === this.focus().age);
    return milestone ? milestone.kinds.map((kind) => this.i18n.t(DETAIL[kind])).join(' ') : '';
  });

  readonly keep = computed(() => strategy(this.focus().strategies, 'keep'));
  readonly term = computed(() => strategy(this.focus().strategies, 'termInvest'));

  readonly title = computed(() =>
    this.i18n.t(
      this.store.projection().assumptions.realDollars ? 'summary.titleReal' : 'summary.title',
      { age: formatAge(this.focus().age) },
    ),
  );

  /** No future cash value entered: the permanent's cash value stays at today's amount. */
  readonly noScale = computed(() => !this.store.projection().assumptions.cashScale);
  readonly showExtra = computed(() => this.store.projection().assumptions.extraMonthly > 0);
  /** Cash value the term side received today by ending the contract in force. */
  readonly surrender = computed(() => this.store.projection().assumptions.surrender);
  readonly termAliveHelp = computed(() =>
    this.surrender() > 0
      ? this.i18n.t('compare.aliveTermSurrender', { cash: formatMoney(this.surrender()) })
      : this.i18n.t('compare.aliveTerm'),
  );

  readonly costGap = computed(() =>
    this.gap('cost', this.keep().cost.value, this.term().cost.value),
  );
  readonly aliveGap = computed(() =>
    this.gap('alive', this.keep().inHand.value, this.term().inHand.value),
  );
  readonly deathGap = computed(() =>
    this.gap('death', this.keep().forHeirs.value, this.term().forHeirs.value),
  );

  /** The parts behind a total, when invested money is one of them. */
  readonly keepAliveParts = computed(() =>
    this.parts('chart.parts.cash', this.keep().alive.value, this.keep().gapSavings?.value ?? 0),
  );
  readonly keepDeathParts = computed(() =>
    this.parts(
      'chart.parts.insurance',
      this.keep().deathBenefit.value,
      this.keep().gapSavings?.value ?? 0,
    ),
  );
  /** Once the term is over, « La temporaire est terminée » already says the total is all savings. */
  readonly termDeathParts = computed(() =>
    this.term().deathBenefit.value > 0
      ? this.parts('chart.parts.insurance', this.term().deathBenefit.value, this.term().alive.value)
      : '',
  );

  /**
   * The cash value at this age lies on a straight line the tool drew from 0 $ to the first row
   * of the table. Real contracts are usually lower in their first years.
   */
  readonly cashLine = computed(() => {
    const cash = this.keep().alive;
    if (cash.formulaId !== 'formula.cash.projected.linear' || cash.params['leftValue'] !== 0) {
      return '';
    }
    return this.i18n.t('compare.cashLine', {
      from: formatAge(cash.params['leftAge'] ?? 0),
      to: formatAge(cash.params['rightAge'] ?? 0),
    });
  });

  readonly breakEven = computed(() => {
    // Without the contract's values, or on the line the tool drew, an even return would only
    // compare against a cash value the contract never gave.
    if (this.noScale() || this.cashLine()) return '';
    const { month, age } = this.focus();
    const found = breakEvenReturn(this.store.input(), month);
    if (!found) return '';
    if (found.kind === 'always') {
      return this.i18n.t('summary.breakEven.always', {
        ahead: this.optionName(found.ahead),
        upTo: formatPercent(found.upTo * 100),
        age: formatAge(age),
      });
    }
    return this.i18n.t('summary.breakEven.rate', {
      rate: formatPercent(Math.round(found.rate * 1000) / 10),
      age: formatAge(age),
      above: this.optionName(found.above),
      below: this.optionName(found.above === 'keep' ? 'termInvest' : 'keep'),
    });
  });

  /** What to keep in mind when reading the table, gathered in one place. */
  readonly notes = computed(() => {
    const assumptions = this.store.projection().assumptions;
    const notes: string[] = [];
    if (this.store.input().permanent.inForce) notes.push(this.i18n.t('summary.note.replace'));
    if (this.noScale()) notes.push(this.i18n.t('summary.note.noScale'));
    if (this.keep().alive.value > 0) notes.push(this.i18n.t('summary.note.cash'));
    if (assumptions.keepInvests) notes.push(this.i18n.t('summary.note.keepGap'));
    notes.push(this.i18n.t('summary.note.death'));
    if (assumptions.account !== 'tfsa') notes.push(this.i18n.t('summary.note.tax'));
    return notes;
  });

  setAge(value: number | null): void {
    if (value === null) return;
    this.store.chosenAge.set(Math.min(this.maxAge(), Math.max(this.minAge(), Math.round(value))));
  }

  private shortcutLabel(kinds: readonly MilestoneKind[], age: number): string {
    const label = kinds.map((kind) => this.i18n.t(LABEL[kind])).join(' · ');
    // « 65 ans » already says its age.
    return kinds.includes('age65')
      ? label
      : this.i18n.t('milestone.withAge', { label, age: formatAge(age) });
  }

  private optionName(id: StrategyId): string {
    return this.i18n.t(id === 'keep' ? 'summary.option.keep' : 'summary.option.termInvest');
  }

  /** For premiums, the option « ahead » is the one that costs more. */
  private gap(kind: 'cost' | 'alive' | 'death', keep: number, term: number): Gap {
    const diff = term - keep;
    // Under half a percent apart, calling one option "ahead" would overstate the precision.
    if (Math.abs(diff) <= Math.max(1, Math.max(keep, term) * 0.005)) {
      return { ahead: null, text: this.i18n.t('summary.gap.same') };
    }
    const ahead: StrategyId = diff > 0 ? 'termInvest' : 'keep';
    const params = { diff: formatMoney(Math.abs(diff)), option: this.optionName(ahead) };
    // Getting the cash value ends the contract: say what it costs in protection.
    if (kind === 'alive' && ahead === 'keep' && this.keep().alive.value > 0) {
      return {
        ahead,
        text: this.i18n.t('summary.gap.aliveSurrender', {
          ...params,
          face: formatMoney(this.keep().deathBenefit.value),
        }),
      };
    }
    return { ahead, text: this.i18n.t(GAP[kind], params) };
  }

  private parts(key: MessageKey, amount: number, savings: number): string {
    return savings > 0
      ? this.i18n.t(key, { amount: formatMoney(amount), savings: formatMoney(savings) })
      : '';
  }
}

const GAP: Record<'cost' | 'alive' | 'death', MessageKey> = {
  cost: 'summary.gap.cost',
  alive: 'summary.gap.alive',
  death: 'summary.gap.death',
};

const LABEL: Record<MilestoneKind, MessageKey> = {
  beforeTermEnd: 'milestone.beforeTermEnd',
  termEnd: 'milestone.termEnd',
  age65: 'milestone.age65',
  horizon: 'milestone.horizon',
};

const DETAIL: Record<MilestoneKind, MessageKey> = {
  beforeTermEnd: 'milestone.detail.beforeTermEnd',
  termEnd: 'milestone.detail.termEnd',
  age65: 'milestone.detail.age65',
  horizon: 'milestone.detail.horizon',
};
