import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { FeesField } from '../engine/blank';
import { FeesForm, FeesSection } from '../fees-form/fees-form';
import { FeesStore } from '../state/fees.store';

interface FeesStep {
  title: MessageKey;
  /** Label in the progress bar, short enough for four to fit on a phone. */
  short: MessageKey;
  intro: MessageKey;
  sections: readonly FeesSection[];
  required: readonly FeesField[];
}

/** One screen per subject, so nobody faces the whole form at once. */
const STEPS: readonly FeesStep[] = [
  {
    title: 'fees.profile.step.savings',
    short: 'fees.profile.step.savings.short',
    intro: 'fees.profile.step.savings.intro',
    sections: ['savings'],
    required: ['amount', 'years'],
  },
  {
    title: 'fees.profile.step.portfolios',
    short: 'fees.profile.step.portfolios.short',
    intro: 'fees.profile.step.portfolios.intro',
    sections: ['portfolios'],
    required: ['return', 'merA', 'merB'],
  },
  {
    title: 'fees.profile.step.tax',
    short: 'fees.profile.step.tax.short',
    intro: 'fees.profile.step.tax.intro',
    sections: ['tax'],
    required: [],
  },
  {
    title: 'fees.profile.step.retirement',
    short: 'fees.profile.step.retirement.short',
    intro: 'fees.profile.step.retirement.intro',
    sections: ['retirement'],
    required: ['drawdownYears'],
  },
];

@Component({
  selector: 'app-fees-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, FeesForm, StepperModule],
  templateUrl: './fees-profile.html',
})
export class FeesProfile {
  readonly i18n = inject(I18nService);
  readonly store = inject(FeesStore);
  private readonly router = inject(Router);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('stepHeading');

  readonly steps = STEPS;
  /** 1-based, like the numbers in the progress bar. Kept in the store, so a return resumes there. */
  readonly step = this.store.profileStep;
  /** Steps where the person pressed Next with missing fields: their errors show. */
  private readonly tried = signal<ReadonlySet<number>>(new Set());

  readonly current = computed(() => STEPS[this.step() - 1] ?? STEPS[0]!);
  readonly isLast = computed(() => this.step() === STEPS.length);
  readonly progress = computed(() =>
    this.i18n.t('profile.progress', { step: this.step(), total: STEPS.length }),
  );
  readonly showErrors = computed(() => this.tried().has(this.step()));
  readonly missingHere = computed(() => this.missingIn(this.step()));
  readonly missingMessage = computed(() =>
    this.i18n.t('profile.missing', {
      fields: this.missingHere()
        .map((field) => this.i18n.t(FIELD[field].label))
        .join(', '),
    }),
  );

  constructor() {
    // A saved step past an incomplete one (or past the end) falls back to the first that needs work.
    let resume = 1;
    while (resume < Math.min(this.step(), STEPS.length) && this.missingIn(resume).length === 0)
      resume++;
    this.step.set(resume);
  }

  /** A step can be opened when every step before it is complete. */
  reachable(step: number): boolean {
    for (let previous = 1; previous < step; previous++) {
      if (this.missingIn(previous).length > 0) return false;
    }
    return true;
  }

  goTo(step: number | undefined): void {
    if (step === undefined || step === this.step()) return;
    if (step > this.step() && !this.reachable(step)) {
      this.next();
      return;
    }
    this.show(step);
  }

  next(): void {
    const missing = this.missingHere();
    if (missing.length > 0) {
      this.tried.update((steps) => new Set(steps).add(this.step()));
      const first = missing[0];
      if (first) document.getElementById(FIELD[first].input)?.focus();
      return;
    }
    if (this.isLast()) {
      this.store.finish();
      void this.router.navigateByUrl('/frais/comparaison');
      return;
    }
    this.show(this.step() + 1);
  }

  back(): void {
    if (this.step() > 1) this.show(this.step() - 1);
  }

  private show(step: number): void {
    this.step.set(step);
    globalThis.scrollTo?.({ top: 0 });
    // Move focus to the new step's title so screen readers announce it.
    queueMicrotask(() => this.heading()?.nativeElement.focus());
  }

  private missingIn(step: number): FeesField[] {
    const required = STEPS[step - 1]?.required ?? [];
    return this.store.missing().filter((field) => required.includes(field));
  }
}

const FIELD: Record<FeesField, { label: MessageKey; input: string }> = {
  amount: { label: 'fees.missing.amount', input: 'fees-initial' },
  years: { label: 'fees.form.years', input: 'fees-years' },
  return: { label: 'fees.form.return', input: 'fees-return' },
  merA: { label: 'fees.missing.merA', input: 'fees-mer-a' },
  merB: { label: 'fees.missing.merB', input: 'fees-mer-b' },
  drawdownYears: { label: 'fees.form.drawdownYears', input: 'fees-drawdown-years' },
};
