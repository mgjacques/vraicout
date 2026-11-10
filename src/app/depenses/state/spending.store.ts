import { Injectable, computed, effect, signal } from '@angular/core';
import { loadSaved, save } from '../../shared/storage/device-storage';
import {
  defaultSpendingForm,
  missingSpendingFields,
  SpendingForm,
  toSpendingInput,
} from '../engine/blank';
import { spendingCost } from '../engine/spending';
import { SpendingInput } from '../engine/types';

const SAVE_KEY = 'depenses';

interface Saved {
  draft: SpendingForm;
  committed: SpendingInput;
}

/**
 * The spending form (draft) and the last complete input (committed), as in the other
 * tools: an emptied amount never becomes a silent 0. One page, no steps.
 */
@Injectable({ providedIn: 'root' })
export class SpendingStore {
  private readonly saved = loadSaved<Saved>(SAVE_KEY);
  readonly draft = signal<SpendingForm>(this.saved?.draft ?? defaultSpendingForm());
  readonly committed = signal<SpendingInput>(
    this.saved?.committed ?? toSpendingInput(defaultSpendingForm()),
  );
  readonly missing = computed(() => missingSpendingFields(this.draft()));
  readonly projection = computed(() => spendingCost(this.committed()));

  constructor() {
    effect(() => save<Saved>(SAVE_KEY, { draft: this.draft(), committed: this.committed() }));
  }

  edit(next: SpendingForm): void {
    this.draft.set(next);
    if (missingSpendingFields(next).length > 0) return;
    this.committed.set(toSpendingInput(next));
  }

  /** Back to the starting figures, as on a first visit. */
  reset(): void {
    this.edit(defaultSpendingForm());
  }
}
