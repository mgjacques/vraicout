import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Slider } from 'primeng/slider';
import { ToggleSwitch } from 'primeng/toggleswitch';
import {
  AgeBy,
  AnchorsBy,
  FormAnchor,
  RequiredField,
  ScenarioForm,
  anchorAt,
  rowAge,
  thisYear,
  toScenarioInput,
} from '../engine/blank';
import { formatAge, formatMoneyExact, formatPercent } from '../../shared/engine/formulas';
import { project } from '../engine/project';
import { Account, Periodicity, TermDuration } from '../engine/types';
import { I18nService } from '../../shared/i18n/i18n.service';
import { MoneyInput } from '../../shared/money-input/money-input';
import { RichText } from '../../shared/rich-text/rich-text';
import { MessageKey } from '../../shared/i18n/fr';
import { ResetButton } from '../../shared/reset/reset-button';
import { ScenarioStore } from '../state/scenario.store';
import { NumberInput } from '../../shared/number-input/number-input';
import { clampTo, Limit } from '../../shared/engine/limits';
import { INSURANCE_LIMITS as L, RETURN_MARKERS } from '../engine/limits';
import { RequiredMark } from '../../shared/required-mark/required-mark';

@Component({
  selector: 'app-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RequiredMark,
    RichText,
    FormsModule,
    Button,
    MoneyInput,
    Message,
    Panel,
    Select,
    SelectButton,
    Slider,
    ToggleSwitch,
    ResetButton,
    NumberInput,
  ],
  templateUrl: './drawer.html',
})
export class Drawer {
  readonly limits = L;
  /** draft: the profile page, committed on demand. live: the comparison, committed on every complete edit. */
  readonly mode = input<'draft' | 'live'>('live');
  /** Sections to show; all by default. The profile page shows one step at a time. */
  readonly sections = input<readonly FormSection[]>(ALL_SECTIONS);
  /** Forces field errors on or off; by default they show in live mode or after a failed attempt. */
  readonly errors = input<boolean | null>(null);
  readonly store = inject(ScenarioStore);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly formatPercent = formatPercent;
  readonly years = computed(() => this.i18n.t('unit.years'));
  readonly percent = computed(() => this.i18n.t('unit.percent'));

  readonly form = this.store.draft;

  readonly periodicityOptions = computed(() => [
    { label: this.i18n.t('drawer.periodicity.month'), value: 'month' as const },
    { label: this.i18n.t('drawer.periodicity.year'), value: 'year' as const },
  ]);

  readonly durationOptions = computed(() =>
    ([10, 20, 25, 30] as const).map((years) => ({
      label: this.i18n.t(DURATION_KEY[years]),
      value: years,
    })),
  );

  readonly accountOptions = computed(() =>
    (['tfsa', 'rrsp', 'taxable'] as const).map((value) => ({
      label: this.i18n.t(ACCOUNT_LABEL[value]),
      value,
    })),
  );
  readonly accountHelp = computed(() => this.i18n.t(ACCOUNT_HELP[this.form().params.account]));
  readonly taxPercent = computed(() => roundPercent(this.form().params.taxRate * 100));
  readonly inflationPercent = computed(() => roundPercent(this.form().params.inflation * 100));
  readonly taxLaterPercent = computed(() => roundPercent(this.form().params.taxRateLater * 100));

  readonly year = thisYear();
  readonly guideUse = GUIDE_USE;
  readonly guideSkip = GUIDE_SKIP;
  readonly inForceOptions = computed(() => [
    { label: this.i18n.t('drawer.inForce.yes'), value: true },
    { label: this.i18n.t('drawer.inForce.no'), value: false },
  ]);

  readonly ageByOptions = computed(() => [
    { label: this.i18n.t('drawer.ageBy.age'), value: 'age' as const },
    { label: this.i18n.t('drawer.ageBy.birthYear'), value: 'birthYear' as const },
  ]);
  // Waits for a full year: « 19 » on the way to 1999 would give a meaningless age.
  readonly birthYearNote = computed(() => {
    const { ageBy, birthYear, currentAge } = this.form().profile;
    return ageBy === 'birthYear' && birthYear !== null && birthYear >= 1000 && currentAge !== null
      ? this.i18n.t('drawer.birthYearHelp', { age: currentAge })
      : '';
  });

  readonly anchorsByOptions = computed(() =>
    (['age', 'year', 'policyYear'] as const).map((value) => ({
      label: this.i18n.t(ANCHORS_BY_LABEL[value]),
      value,
    })),
  );
  readonly anchorsBy = computed(() => this.form().permanent.anchorsBy);
  readonly anchorsByHelp = computed(() => this.i18n.t(ANCHORS_BY_HELP[this.anchorsBy()]));
  readonly anchorLabel = computed(() => this.i18n.t(ANCHOR_AT_LABEL[this.anchorsBy()]));
  readonly anchorSuffix = computed(() => (this.anchorsBy() === 'age' ? this.years() : ''));
  readonly anchorRange = computed(() => {
    const mode = this.anchorsBy();
    if (mode === 'age') return { min: 0, max: 130 };
    if (mode === 'year') return { min: this.year - 80, max: this.year + 100 };
    return { min: 1, max: 100 };
  });

  readonly markers = computed(() => [
    { label: this.i18n.t('drawer.tick.savings'), value: RETURN_MARKERS.shortTerm },
    { label: this.i18n.t('drawer.tick.bonds'), value: RETURN_MARKERS.bonds },
    { label: this.i18n.t('drawer.tick.equities'), value: RETURN_MARKERS.equities },
  ]);

  readonly returnPercent = computed(() => roundPercent(this.form().params.annualReturn * 100));
  readonly reinvestPercent = computed(() => roundPercent(this.form().params.reinvestShare * 100));
  readonly growthPercent = computed(() =>
    roundPercent(this.form().permanent.projectedGrowth * 100),
  );
  private readonly preview = computed(() => project(toScenarioInput(this.form())));

  /** Missing fields, named, once errors should show. */
  readonly missingLabel = computed(() =>
    this.store
      .missing()
      .map((field) => this.i18n.t(FIELD_LABEL[field]))
      .join(', '),
  );
  readonly showErrors = computed(
    () => this.errors() ?? (this.mode() === 'live' || this.store.attempted()),
  );

  readonly phases = computed(() => {
    const projection = this.preview();
    const ageAt = (month: number) => formatAge(projection.currentAge + month / 12);
    const { surrender } = projection.assumptions;
    const today =
      surrender > 0
        ? [this.i18n.t('drawer.phase.surrender', { cash: formatMoneyExact(surrender) })]
        : [];
    const monthly = projection.assumptions.phases
      .filter((phase) => phase.keepMonthly > 0 || phase.termMonthly > 0)
      .map((phase) => {
        const range = { from: ageAt(phase.fromMonth - 1), to: ageAt(phase.toMonth) };
        if (!phase.side) return this.i18n.t('drawer.phase.none', range);
        const text = this.i18n.t(
          phase.side === 'keep' ? 'drawer.phase.keep' : 'drawer.phase.termInvest',
          {
            ...range,
            gap: formatMoneyExact(phase.gap),
            deposit: formatMoneyExact(phase.deposit),
          },
        );
        return phase.spent > 0
          ? `${text} ${this.i18n.t('drawer.phase.spent', { spent: formatMoneyExact(phase.spent) })}`
          : text;
      });
    return [...today, ...monthly];
  });

  readonly horizonNote = computed(() => {
    const requested = this.form().profile.horizonAge ?? 0;
    const effective = this.preview().horizonAge;
    if (requested > 0 && effective > requested) {
      // Only the end of the term pushes the horizon past the age asked for.
      return this.i18n.t('drawer.horizonRaised', { asked: requested, age: effective });
    }
    return '';
  });

  shows(section: FormSection): boolean {
    return this.sections().includes(section);
  }

  invalid(field: RequiredField): boolean {
    return this.showErrors() && this.store.missing().includes(field);
  }

  anchorPast(anchor: FormAnchor): boolean {
    const current = this.form().profile.currentAge;
    const age = rowAge(this.form(), anchor);
    return current !== null && age !== null && age < current;
  }

  /** "About 45" under a year or policy-year row, so the person can check the reading. */
  anchorAgeNote(anchor: FormAnchor): string {
    if (anchor.pendingAge !== undefined) {
      return this.i18n.t('drawer.anchorPending', { age: anchor.pendingAge });
    }
    if (this.anchorsBy() === 'age') return '';
    const age = rowAge(this.form(), anchor);
    return age === null ? '' : this.i18n.t('drawer.anchorAgeNote', { age });
  }

  setAge(value: number | null): void {
    this.edit((draft) => {
      draft.profile.currentAge = value === null ? null : clampTo(Math.round(value), L.age);
    });
  }

  setAgeBy(value: AgeBy | null): void {
    if (!value) return;
    this.edit((draft) => {
      draft.profile.ageBy = value;
      if (value !== 'birthYear') return;
      // A year already typed wins over an age typed on the other tab: the age follows it.
      if (draft.profile.birthYear !== null) {
        draft.profile.currentAge = clampTo(this.year - draft.profile.birthYear, L.age);
      } else if (draft.profile.currentAge !== null) {
        draft.profile.birthYear = this.year - draft.profile.currentAge;
      }
    });
  }

  setBirthYear(value: number | null): void {
    this.edit((draft) => {
      draft.profile.birthYear = value === null ? null : Math.round(value);
      draft.profile.currentAge =
        draft.profile.birthYear === null
          ? null
          : clampTo(this.year - draft.profile.birthYear, L.age);
    });
  }

  /** Changing the unit keeps each row at the same moment, rewritten in the new unit. */
  setAnchorsBy(value: AnchorsBy): void {
    this.edit((draft) => {
      for (const anchor of draft.permanent.anchors) {
        const age = rowAge(draft, anchor);
        if (age === null) continue;
        const at = anchorAt(draft, age, value);
        if (at === null) {
          anchor.pendingAge = age;
        } else {
          anchor.at = at;
          delete anchor.pendingAge;
        }
      }
      draft.permanent.anchorsBy = value;
    });
  }

  setContractStart(value: number | null): void {
    this.edit((draft) => {
      draft.permanent.contractStartYear = value === null ? null : Math.round(value);
      // Rows waiting for the start year can now be written as policy years.
      for (const anchor of draft.permanent.anchors) {
        if (anchor.pendingAge === undefined) continue;
        const at = anchorAt(draft, anchor.pendingAge, draft.permanent.anchorsBy);
        if (at !== null) {
          anchor.at = at;
          delete anchor.pendingAge;
        }
      }
    });
  }

  setHorizon(value: number | null): void {
    this.edit((draft) => {
      draft.profile.horizonAge = value === null ? null : clampTo(Math.round(value), L.horizonAge);
    });
  }

  setPremium(value: number | null): void {
    this.edit((draft) => {
      draft.permanent.premium = value === null ? null : cents(value, L.premium);
    });
  }

  setPeriod(value: Periodicity): void {
    this.edit((draft) => {
      draft.permanent.periodicity = value;
    });
  }

  setFace(value: number | null): void {
    this.edit((draft) => {
      draft.permanent.deathBenefit = value === null ? null : cents(value, L.deathBenefit);
    });
  }

  setInForce(value: boolean): void {
    this.edit((draft) => {
      draft.permanent.inForce = value;
    });
  }

  setCash(value: number | null): void {
    this.edit((draft) => {
      draft.permanent.cashValueNow = value === null ? null : cents(value, L.cashValue);
    });
  }

  setPremiumYears(value: number | null): void {
    this.edit((draft) => {
      draft.permanent.premiumYearsRemaining =
        value === null ? null : clampTo(Math.round(value), L.premiumYears);
    });
  }

  setGrowth(value: number | null): void {
    this.edit((draft) => {
      draft.permanent.projectedGrowth = fromPercent(value, L.growthPercent);
    });
  }

  setTermPremium(value: number | null): void {
    this.edit((draft) => {
      draft.term.premium = value === null ? null : cents(value, L.premium);
    });
  }

  setTermPeriod(value: Periodicity): void {
    this.edit((draft) => {
      draft.term.periodicity = value;
    });
  }

  setTermFace(value: number | null): void {
    this.edit((draft) => {
      draft.term.deathBenefit = value === null ? null : cents(value, L.deathBenefit);
    });
  }

  setDuration(value: TermDuration): void {
    this.edit((draft) => {
      draft.term.durationYears = value;
    });
  }

  setReturn(value: number | null): void {
    this.edit((draft) => {
      draft.params.annualReturn = clamp(roundPercent(value ?? 0) / 100, 0, 0.1);
    });
  }

  setReinvest(value: number | null): void {
    this.edit((draft) => {
      draft.params.reinvestShare = clamp(roundPercent(value ?? 0) / 100, 0, 1);
    });
  }

  setExtra(value: number | null): void {
    this.edit((draft) => {
      draft.params.extraSavingsMonthly = cents(value, L.extraSavings);
    });
  }

  setAccount(value: Account): void {
    this.edit((draft) => {
      draft.params.account = value;
    });
  }

  setTaxRate(value: number | null): void {
    this.edit((draft) => {
      const previous = draft.params.taxRate;
      draft.params.taxRate = fromPercent(value, L.taxPercent);
      // Until the person sets a different withdrawal rate, it follows today's rate.
      if (draft.params.taxRateLater === previous) draft.params.taxRateLater = draft.params.taxRate;
    });
  }

  setRealDollars(value: boolean): void {
    this.edit((draft) => {
      draft.params.realDollars = value;
    });
  }

  setInflation(value: number | null): void {
    this.edit((draft) => {
      draft.params.inflation = fromPercent(value, L.inflationPercent);
    });
  }

  setTaxRateLater(value: number | null): void {
    this.edit((draft) => {
      draft.params.taxRateLater = fromPercent(value, L.taxPercent);
    });
  }

  setAnchorAt(index: number, value: number | null): void {
    if (value === null) return;
    const { min, max } = this.anchorRange();
    this.edit((draft) => {
      const anchor = draft.permanent.anchors[index];
      if (!anchor) return;
      anchor.at = clamp(Math.round(value), min, max);
      delete anchor.pendingAge;
    });
  }

  setAnchorGuaranteed(index: number, value: number | null): void {
    this.edit((draft) => {
      const anchor = draft.permanent.anchors[index];
      if (anchor) anchor.guaranteed = value === null ? null : cents(value, L.cashValue);
    });
  }

  setAnchorProjected(index: number, value: number | null): void {
    this.edit((draft) => {
      const anchor = draft.permanent.anchors[index];
      if (anchor) anchor.projected = value === null ? null : cents(value, L.cashValue);
    });
  }

  addAnchor(): void {
    this.edit((draft) => {
      // A new row starts ten years ahead, in whatever unit the table uses.
      const inTen = anchorAt(
        draft,
        (draft.profile.currentAge ?? 25) + 10,
        draft.permanent.anchorsBy,
      );
      draft.permanent.anchors.push({
        at: inTen ?? 10,
        ...(inTen === null && draft.profile.currentAge !== null
          ? { pendingAge: draft.profile.currentAge + 10 }
          : {}),
        guaranteed: null,
        projected: null,
      });
    });
  }

  removeAnchor(index: number): void {
    this.edit((draft) => {
      draft.permanent.anchors.splice(index, 1);
    });
  }

  /** Empties the form and starts again from the introduction. */
  reset(): void {
    this.store.reset();
    void this.router.navigateByUrl('/assurance');
  }

  private edit(recipe: (draft: ScenarioForm) => void): void {
    const next = structuredClone(this.form());
    recipe(next);
    this.store.edit(next, this.mode() === 'live');
  }
}

export type FormSection = 'profile' | 'permanent' | 'anchors' | 'term' | 'params' | 'display';

const ALL_SECTIONS: readonly FormSection[] = [
  'profile',
  'permanent',
  'anchors',
  'term',
  'params',
  'display',
];

const FIELD_LABEL: Record<RequiredField, MessageKey> = {
  age: 'drawer.age',
  premium: 'drawer.premium',
  face: 'drawer.deathBenefit',
  years: 'drawer.premiumYears',
  contractStart: 'drawer.contractStart',
  termPremium: 'drawer.termPremium',
  termFace: 'drawer.termDeath',
};

interface GuideItem {
  title: MessageKey;
  where?: MessageKey;
  body: MessageKey;
  aka?: MessageKey;
}

/** Columns found in contract value tables, with where each one goes. */
const GUIDE_USE: readonly GuideItem[] = [
  {
    title: 'guide.cash.title',
    where: 'guide.cash.where',
    body: 'guide.cash.body',
    aka: 'guide.cash.aka',
  },
  {
    title: 'guide.total.title',
    where: 'guide.total.where',
    body: 'guide.total.body',
    aka: 'guide.total.aka',
  },
  { title: 'guide.net.title', where: 'guide.net.where', body: 'guide.net.body' },
];

const GUIDE_SKIP: readonly GuideItem[] = [
  { title: 'guide.paidUp.title', body: 'guide.paidUp.body', aka: 'guide.paidUp.aka' },
  { title: 'guide.extended.title', body: 'guide.extended.body', aka: 'guide.extended.aka' },
  { title: 'guide.loan.title', body: 'guide.loan.body' },
];

const ANCHORS_BY_LABEL: Record<AnchorsBy, MessageKey> = {
  age: 'drawer.anchorsBy.age',
  year: 'drawer.anchorsBy.year',
  policyYear: 'drawer.anchorsBy.policyYear',
};

const ANCHORS_BY_HELP: Record<AnchorsBy, MessageKey> = {
  age: 'drawer.anchorsByHelp.age',
  year: 'drawer.anchorsByHelp.year',
  policyYear: 'drawer.anchorsByHelp.policyYear',
};

const ANCHOR_AT_LABEL: Record<AnchorsBy, MessageKey> = {
  age: 'drawer.anchorAge',
  year: 'drawer.anchorAt.year',
  policyYear: 'drawer.anchorAt.policyYear',
};

const ACCOUNT_LABEL: Record<Account, MessageKey> = {
  tfsa: 'drawer.account.tfsa',
  rrsp: 'drawer.account.rrsp',
  taxable: 'drawer.account.taxable',
};

const ACCOUNT_HELP: Record<Account, MessageKey> = {
  tfsa: 'drawer.accountHelp.tfsa',
  rrsp: 'drawer.accountHelp.rrsp',
  taxable: 'drawer.accountHelp.taxable',
};

const DURATION_KEY: Record<TermDuration, MessageKey> = {
  10: 'drawer.duration.10',
  20: 'drawer.duration.20',
  25: 'drawer.duration.25',
  30: 'drawer.duration.30',
};

function cents(value: number | null, limit: Limit): number {
  return clampTo(Math.round((value ?? 0) * 100) / 100, limit);
}

/** A typed percent, bounded, as a rate: 2,5 gives 0,025. An emptied field counts as 0. */
function fromPercent(value: number | null, limit: Limit): number {
  return clampTo(roundPercent(value ?? 0), limit) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
