import { Injectable, computed, effect, signal } from '@angular/core';
import { loadSaved, save } from '../../shared/storage/device-storage';
import {
  defaultMortgageForm,
  missingMortgageFields,
  MortgageForm,
  toMortgageInput,
} from '../engine/blank';
import { deathAt, projectMortgage } from '../engine/mortgage';
import { MortgageInput, PersonId } from '../engine/types';

const SAVE_KEY = 'hypotheque';

interface Saved {
  draft: MortgageForm;
  committed: MortgageInput;
  finished: boolean;
  profileStep: number;
  deathYear: number | null;
  deathPerson: PersonId;
}

/**
 * The mortgage form (draft) and the last complete input (committed), as in the fees tool:
 * the form opens on round figures, and an emptied field never becomes a silent 0. Also
 * keeps the year and the person the results look at for a death.
 */
@Injectable({ providedIn: 'root' })
export class MortgageStore {
  private readonly saved = loadSaved<Saved>(SAVE_KEY);
  readonly draft = signal<MortgageForm>(this.saved?.draft ?? defaultMortgageForm());
  readonly committed = signal<MortgageInput>(
    this.saved?.committed ?? toMortgageInput(defaultMortgageForm()),
  );
  /** The person went through every step: the results open directly from now on. */
  readonly finished = signal(this.saved?.finished ?? false);
  /** The step the person was on, 1-based, so leaving and coming back resumes there. */
  readonly profileStep = signal(this.saved?.profileStep ?? 1);
  /** Chosen loan year for a death; null follows the middle of the loan. */
  readonly deathYear = signal<number | null>(this.saved?.deathYear ?? null);
  readonly deathPerson = signal<PersonId>(this.saved?.deathPerson ?? 'p1');
  readonly missing = computed(() => missingMortgageFields(this.draft()));
  readonly projection = computed(() => projectMortgage(this.committed()));
  /** The chosen year, kept within the loan when its length changes. */
  readonly year = computed(() => {
    const years = this.projection().input.loan.years;
    return Math.min(years, Math.max(1, this.deathYear() ?? Math.ceil(years / 2)));
  });
  readonly death = computed(() => deathAt(this.projection(), this.year(), this.deathPerson()));
  /** The person has begun the steps: the introduction is behind them. */
  readonly started = computed(
    () =>
      this.profileStep() > 1 ||
      JSON.stringify(this.draft()) !== JSON.stringify(defaultMortgageForm()),
  );

  constructor() {
    effect(() =>
      save<Saved>(SAVE_KEY, {
        draft: this.draft(),
        committed: this.committed(),
        finished: this.finished(),
        profileStep: this.profileStep(),
        deathYear: this.deathYear(),
        deathPerson: this.deathPerson(),
      }),
    );
  }

  edit(next: MortgageForm): void {
    this.draft.set(next);
    if (missingMortgageFields(next).length > 0) return;
    this.committed.set(toMortgageInput(next));
  }

  /** Last step done: only a complete form gets here, and edit() has already committed it. */
  finish(): void {
    this.finished.set(true);
  }

  /** Back to the starting figures and the introduction, as on a first visit. */
  reset(): void {
    this.edit(defaultMortgageForm());
    this.finished.set(false);
    this.profileStep.set(1);
    this.deathYear.set(null);
    this.deathPerson.set('p1');
  }
}
