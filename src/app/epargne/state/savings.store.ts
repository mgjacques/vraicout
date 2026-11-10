import { Injectable, computed, effect, signal } from '@angular/core';
import { loadSaved, save } from '../../shared/storage/device-storage';
import {
  defaultSavingsForm,
  missingSavingsFields,
  SavingsForm,
  toSavingsInput,
} from '../engine/blank';
import { projectSavings } from '../engine/growth';
import { SavingsInput } from '../engine/types';

const SAVE_KEY = 'epargne';

interface Saved {
  draft: SavingsForm;
  committed: SavingsInput;
}

/**
 * The savings form (draft) and the last complete input (committed), as in the other tools:
 * an emptied deposit never becomes a silent 0. One page, no steps: nothing else to keep.
 */
@Injectable({ providedIn: 'root' })
export class SavingsStore {
  private readonly saved = loadSaved<Saved>(SAVE_KEY);
  readonly draft = signal<SavingsForm>(this.saved?.draft ?? defaultSavingsForm());
  readonly committed = signal<SavingsInput>(
    this.saved?.committed ?? toSavingsInput(defaultSavingsForm()),
  );
  readonly missing = computed(() => missingSavingsFields(this.draft()));
  readonly projection = computed(() => projectSavings(this.committed()));

  constructor() {
    effect(() => save<Saved>(SAVE_KEY, { draft: this.draft(), committed: this.committed() }));
  }

  edit(next: SavingsForm): void {
    this.draft.set(next);
    if (missingSavingsFields(next).length > 0) return;
    this.committed.set(toSavingsInput(next));
  }

  /** Back to the starting figures, as on a first visit. */
  reset(): void {
    this.edit(defaultSavingsForm());
  }
}
