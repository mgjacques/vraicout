import { Injectable, computed, effect, signal } from '@angular/core';
import { loadSaved, save } from '../../shared/storage/device-storage';
import { defaultFeesForm, FeesForm, missingFeesFields, toFeesInput } from '../engine/blank';
import { projectFees } from '../engine/fees';
import { FeesInput } from '../engine/types';

const SAVE_KEY = 'frais';

interface Saved {
  draft: FeesForm;
  committed: FeesInput;
  /** Older saves have none: they predate the steps and already showed the results. */
  finished?: boolean;
  profileStep?: number;
}

/**
 * The fees form (draft) and the last complete input (committed). The form opens
 * on round example figures, and an emptied field never becomes a silent 0.
 * Both are kept on the device between visits, with where the person is in the steps.
 */
@Injectable({ providedIn: 'root' })
export class FeesStore {
  private readonly saved = loadSaved<Saved>(SAVE_KEY);
  readonly draft = signal<FeesForm>(this.saved?.draft ?? defaultFeesForm());
  readonly committed = signal<FeesInput>(this.saved?.committed ?? toFeesInput(defaultFeesForm()));
  /** The person went through every step: the results open directly from now on. */
  readonly finished = signal(this.saved ? (this.saved.finished ?? true) : false);
  /** The step the person was on, 1-based, so leaving and coming back resumes there. */
  readonly profileStep = signal(this.saved?.profileStep ?? 1);
  readonly missing = computed(() => missingFeesFields(this.draft()));
  readonly projection = computed(() => projectFees(this.committed()));
  /** The person has begun the steps: the introduction is behind them. */
  readonly started = computed(
    () =>
      this.profileStep() > 1 || JSON.stringify(this.draft()) !== JSON.stringify(defaultFeesForm()),
  );

  constructor() {
    effect(() =>
      save<Saved>(SAVE_KEY, {
        draft: this.draft(),
        committed: this.committed(),
        finished: this.finished(),
        profileStep: this.profileStep(),
      }),
    );
  }

  edit(next: FeesForm): void {
    this.draft.set(next);
    if (missingFeesFields(next).length > 0) return;
    this.committed.set(toFeesInput(next));
  }

  /** Last step done: only a complete form gets here, and edit() has already committed it. */
  finish(): void {
    this.finished.set(true);
  }

  /** Back to the starting figures and the introduction, as on a first visit. */
  reset(): void {
    this.edit(defaultFeesForm());
    this.finished.set(false);
    this.profileStep.set(1);
  }
}
