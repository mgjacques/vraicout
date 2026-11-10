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
import { Drawer, FormSection } from '../drawer/drawer';
import { RequiredField } from '../engine/blank';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ScenarioStore } from '../state/scenario.store';

interface ProfileStep {
  title: MessageKey;
  /** Label in the progress bar, short enough for four to fit on a phone. */
  short: MessageKey;
  intro: MessageKey;
  sections: readonly FormSection[];
  required: readonly RequiredField[];
}

/** One screen per subject, so nobody faces the whole form at once. */
const STEPS: readonly ProfileStep[] = [
  {
    title: 'profile.step.you',
    short: 'profile.step.you.short',
    intro: 'profile.step.you.intro',
    sections: ['profile'],
    required: ['age'],
  },
  {
    title: 'profile.step.permanent',
    short: 'profile.step.permanent.short',
    intro: 'profile.step.permanent.intro',
    sections: ['permanent', 'anchors'],
    required: ['premium', 'face', 'years', 'contractStart'],
  },
  {
    title: 'profile.step.term',
    short: 'profile.step.term.short',
    intro: 'profile.step.term.intro',
    sections: ['term'],
    required: ['termPremium', 'termFace'],
  },
  {
    title: 'profile.step.params',
    short: 'profile.step.params.short',
    intro: 'profile.step.params.intro',
    sections: ['params', 'display'],
    required: [],
  },
];

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Drawer, StepperModule],
  templateUrl: './profile.html',
})
export class Profile {
  readonly i18n = inject(I18nService);
  readonly store = inject(ScenarioStore);
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
      if (this.store.commitDraft()) void this.router.navigateByUrl('/assurance/comparaison');
      return;
    }
    this.show(this.step() + 1);
  }

  back(): void {
    if (this.step() > 1) this.show(this.step() - 1);
  }

  example(): void {
    this.store.useExample();
    void this.router.navigateByUrl('/assurance/comparaison');
  }

  private show(step: number): void {
    this.step.set(step);
    globalThis.scrollTo?.({ top: 0 });
    // Move focus to the new step's title so screen readers announce it.
    queueMicrotask(() => this.heading()?.nativeElement.focus());
  }

  private missingIn(step: number): RequiredField[] {
    const required = STEPS[step - 1]?.required ?? [];
    return this.store.missing().filter((field) => required.includes(field));
  }
}

const FIELD: Record<RequiredField, { label: MessageKey; input: string }> = {
  age: { label: 'drawer.age', input: 'age' },
  premium: { label: 'drawer.premium', input: 'premium' },
  face: { label: 'drawer.deathBenefit', input: 'face' },
  years: { label: 'drawer.premiumYears', input: 'years' },
  contractStart: { label: 'drawer.contractStart', input: 'contract-start' },
  termPremium: { label: 'drawer.termPremium', input: 'term-premium' },
  termFace: { label: 'drawer.termDeath', input: 'term-face' },
};
