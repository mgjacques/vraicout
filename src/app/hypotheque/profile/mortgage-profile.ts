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
import { MortgageField } from '../engine/blank';
import { fieldLabel, MortgageForm, MortgageSection } from '../mortgage-form/mortgage-form';
import { MortgageStore } from '../state/mortgage.store';

interface MortgageStep {
  title: MessageKey;
  /** Label in the progress bar, short enough for three to fit on a phone. */
  short: MessageKey;
  intro: MessageKey;
  sections: readonly MortgageSection[];
  required: readonly MortgageField[];
}

/** One screen per subject, so nobody faces the whole form at once. */
const STEPS: readonly MortgageStep[] = [
  {
    title: 'mortgage.profile.step.loan',
    short: 'mortgage.profile.step.loan.short',
    intro: 'mortgage.profile.step.loan.intro',
    sections: ['loan'],
    required: ['loanAmount', 'loanYears', 'loanRate'],
  },
  {
    title: 'mortgage.profile.step.bank',
    short: 'mortgage.profile.step.bank.short',
    intro: 'mortgage.profile.step.bank.intro',
    sections: ['bank'],
    required: ['bankPremium'],
  },
  {
    title: 'mortgage.profile.step.term',
    short: 'mortgage.profile.step.term.short',
    intro: 'mortgage.profile.step.term.intro',
    sections: ['term'],
    required: [
      'termAmount1',
      'termYears1',
      'termPremium1',
      'termAmount2',
      'termYears2',
      'termPremium2',
    ],
  },
];

@Component({
  selector: 'app-mortgage-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, MortgageForm, StepperModule],
  templateUrl: './mortgage-profile.html',
})
export class MortgageProfile {
  readonly i18n = inject(I18nService);
  readonly store = inject(MortgageStore);
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
        .map((field) => fieldLabel(this.i18n, field, this.store.draft()))
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
      if (first) document.getElementById(FIELD_INPUT[first])?.focus();
      return;
    }
    if (this.isLast()) {
      this.store.finish();
      void this.router.navigateByUrl('/hypotheque/comparaison');
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

  private missingIn(step: number): MortgageField[] {
    const required = STEPS[step - 1]?.required ?? [];
    return this.store.missing().filter((field) => required.includes(field));
  }
}

const FIELD_INPUT: Record<MortgageField, string> = {
  loanAmount: 'mortgage-loan-amount',
  loanYears: 'mortgage-loan-years',
  loanRate: 'mortgage-loan-rate',
  bankPremium: 'mortgage-bank-premium',
  termAmount1: 'mortgage-term-amount-p1',
  termYears1: 'mortgage-term-years-p1',
  termPremium1: 'mortgage-term-premium-p1',
  termAmount2: 'mortgage-term-amount-p2',
  termYears2: 'mortgage-term-years-p2',
  termPremium2: 'mortgage-term-premium-p2',
};
