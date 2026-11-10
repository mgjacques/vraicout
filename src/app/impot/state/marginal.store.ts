import { Injectable, computed, effect, signal } from '@angular/core';
import { loadSaved, save } from '../../shared/storage/device-storage';
import {
  defaultMarginalForm,
  MarginalForm,
  missingMarginalFields,
  toMarginalInput,
} from '../engine/blank';
import { marginalRate } from '../engine/marginal';
import { MarginalInput } from '../engine/types';

const SAVE_KEY = 'impot';

interface Saved {
  draft: MarginalForm;
  committed: MarginalInput;
}

/**
 * The marginal rate form (draft) and the last complete input (committed), as in the other tools:
 * an emptied income never becomes a silent 0. One page, no steps: nothing else to keep.
 */
@Injectable({ providedIn: 'root' })
export class MarginalStore {
  private readonly saved = loadSaved<Saved>(SAVE_KEY);
  readonly draft = signal<MarginalForm>(this.saved?.draft ?? defaultMarginalForm());
  readonly committed = signal<MarginalInput>(
    this.saved?.committed ?? toMarginalInput(defaultMarginalForm()),
  );
  readonly missing = computed(() => missingMarginalFields(this.draft()));
  readonly projection = computed(() => marginalRate(this.committed()));

  constructor() {
    effect(() => save<Saved>(SAVE_KEY, { draft: this.draft(), committed: this.committed() }));
  }

  edit(next: MarginalForm): void {
    this.draft.set(next);
    if (missingMarginalFields(next).length > 0) return;
    this.committed.set(toMarginalInput(next));
  }

  /** Back to the starting figures, as on a first visit. */
  reset(): void {
    this.edit(defaultMarginalForm());
  }
}
