import { Injectable, computed, effect, signal } from '@angular/core';
import { loadSaved, save } from '../../shared/storage/device-storage';
import { blankForm, missingFields, ScenarioForm, toForm, toScenarioInput } from '../engine/blank';
import { exampleScenario } from '../engine/example';
import { project } from '../engine/project';
import { ScenarioInput } from '../engine/types';

const SAVE_KEY = 'assurance';

interface Saved {
  draft: ScenarioForm;
  committed: ScenarioInput | null;
  illustrative: boolean;
  profileStep: number;
}

/**
 * The form the person edits (draft) and the last complete scenario (committed).
 * The comparison only ever shows a committed scenario, so an emptied field never
 * becomes a silent 0 in the numbers. Both are kept on the device between visits.
 */
@Injectable({ providedIn: 'root' })
export class ScenarioStore {
  private readonly saved = loadSaved<Saved>(SAVE_KEY);
  readonly draft = signal<ScenarioForm>(this.saved?.draft ?? blankForm());
  readonly committed = signal<ScenarioInput | null>(this.saved?.committed ?? null);
  readonly illustrative = signal(this.saved?.illustrative ?? false);
  /** The profile step the person was on, 1-based, so leaving and coming back resumes there. */
  readonly profileStep = signal(this.saved?.profileStep ?? 1);
  /** Set once the person tried to continue with missing fields: errors show from then on. */
  readonly attempted = signal(false);
  readonly missing = computed(() => missingFields(this.draft()));
  readonly draftReady = computed(() => this.missing().length === 0);
  readonly input = computed(() => this.committed() ?? toScenarioInput(this.draft()));
  readonly projection = computed(() => project(this.input()));
  /**
   * Age the comparison is read at, shared by the summary and the charts. Null follows the end
   * of the term. Only for this visit: it is not kept on the device.
   */
  readonly chosenAge = signal<number | null>(null);
  /** The chosen age within the projection, and the year row it reads. */
  readonly focus = computed(() => {
    const projection = this.projection();
    const wanted = Math.round(this.chosenAge() ?? projection.termEndAge);
    const age = Math.min(
      Math.floor(projection.horizonAge),
      Math.max(projection.currentAge, wanted),
    );
    const month = (age - projection.currentAge) * 12;
    const row = projection.years.find((item) => item.month === month) ?? projection.years[0]!;
    return { age, month, strategies: row.strategies };
  });
  /** The person has begun the profile: the introduction is behind them. */
  readonly started = computed(
    () => this.profileStep() > 1 || JSON.stringify(this.draft()) !== JSON.stringify(blankForm()),
  );

  constructor() {
    effect(() =>
      save<Saved>(SAVE_KEY, {
        draft: this.draft(),
        committed: this.committed(),
        illustrative: this.illustrative(),
        profileStep: this.profileStep(),
      }),
    );
  }

  /** Live edits from the comparison: committed as soon as the form is complete. */
  edit(next: ScenarioForm, live: boolean): void {
    this.draft.set(next);
    if (!live || missingFields(next).length > 0) return;
    const input = toScenarioInput(next);
    const current = this.committed();
    if (current && JSON.stringify(current) === JSON.stringify(input)) return;
    this.illustrative.set(false);
    this.committed.set(input);
  }

  commitDraft(): boolean {
    if (!this.draftReady()) {
      this.attempted.set(true);
      return false;
    }
    this.illustrative.set(false);
    this.committed.set(toScenarioInput(this.draft()));
    return true;
  }

  useExample(): void {
    const example = exampleScenario();
    this.draft.set(toForm(example));
    this.committed.set(example);
    this.illustrative.set(true);
  }

  /** Back to an empty form, as on a first visit. */
  reset(): void {
    this.draft.set(blankForm());
    this.committed.set(null);
    this.illustrative.set(false);
    this.attempted.set(false);
    this.profileStep.set(1);
    this.chosenAge.set(null);
  }
}
