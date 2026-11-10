import { Injectable, computed, effect, signal } from '@angular/core';
import { loadSaved, save } from '../../shared/storage/device-storage';
import { defaultSplitForm, missingSplitFields, SplitForm, toSplitInput } from '../engine/blank';
import { splitIncomes } from '../engine/split';
import { SplitInput } from '../engine/types';

const SAVE_KEY = 'partage';

interface Saved {
  draft: SplitForm;
  committed: SplitInput;
}

/**
 * The split form (draft) and the last complete input (committed), as in the other tools:
 * an emptied pay never becomes a silent 0. One page, no steps: nothing else to keep.
 */
@Injectable({ providedIn: 'root' })
export class SplitStore {
  private readonly saved = loadSaved<Saved>(SAVE_KEY);
  readonly draft = signal<SplitForm>(this.saved?.draft ?? defaultSplitForm());
  readonly committed = signal<SplitInput>(
    this.saved?.committed ?? toSplitInput(defaultSplitForm()),
  );
  readonly missing = computed(() => missingSplitFields(this.draft()));
  readonly projection = computed(() => splitIncomes(this.committed()));

  constructor() {
    effect(() => save<Saved>(SAVE_KEY, { draft: this.draft(), committed: this.committed() }));
  }

  edit(next: SplitForm): void {
    this.draft.set(next);
    if (missingSplitFields(next).length > 0) return;
    this.committed.set(toSplitInput(next));
  }

  /** Back to the starting figures, as on a first visit. */
  reset(): void {
    this.edit(defaultSplitForm());
  }
}
