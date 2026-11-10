import { Injectable, computed, effect, signal } from '@angular/core';
import { loadSaved, save } from '../../shared/storage/device-storage';
import { defaultWorkForm, missingWorkFields, toWorkInput, WorkForm } from '../engine/blank';
import { hoursOfWork } from '../engine/hours';
import { WorkInput } from '../engine/types';

const SAVE_KEY = 'heures';

interface Saved {
  draft: WorkForm;
  committed: WorkInput;
}

/**
 * The hours form (draft) and the last complete input (committed), as in the other tools:
 * an emptied pay never becomes a silent 0. One page, no steps: nothing else to keep.
 */
@Injectable({ providedIn: 'root' })
export class HoursStore {
  private readonly saved = loadSaved<Saved>(SAVE_KEY);
  readonly draft = signal<WorkForm>(this.saved?.draft ?? defaultWorkForm());
  readonly committed = signal<WorkInput>(this.saved?.committed ?? toWorkInput(defaultWorkForm()));
  readonly missing = computed(() => missingWorkFields(this.draft()));
  readonly projection = computed(() => hoursOfWork(this.committed()));

  constructor() {
    effect(() => save<Saved>(SAVE_KEY, { draft: this.draft(), committed: this.committed() }));
  }

  edit(next: WorkForm): void {
    this.draft.set(next);
    if (missingWorkFields(next).length > 0) return;
    this.committed.set(toWorkInput(next));
  }

  /** Back to the starting figures, as on a first visit. */
  reset(): void {
    this.edit(defaultWorkForm());
  }
}
