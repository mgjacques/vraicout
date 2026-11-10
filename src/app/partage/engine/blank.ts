import { Frequency } from '../../shared/engine/pay';
import { PersonId, SplitInput } from './types';

/** One person's pay as typed: a figure left empty is null. */
export interface PersonForm {
  label: string;
  frequency: Frequency;
  salary: number | null;
}

/** The split page form. Null means the person emptied the field. */
export interface SplitForm {
  people: Record<PersonId, PersonForm>;
  bill: number | null;
}

/** Fields without which the split means nothing. */
export type SplitField = 'salary1' | 'salary2';

/** Round figures that differ enough to show a split at once. */
export function defaultSplitForm(): SplitForm {
  return {
    people: {
      p1: { label: '', frequency: 'year', salary: 75_000 },
      p2: { label: '', frequency: 'year', salary: 55_000 },
    },
    bill: null,
  };
}

/** Both salaries are needed; one of them may be 0, but not both. */
export function missingSplitFields(form: SplitForm): SplitField[] {
  const { p1, p2 } = form.people;
  if (p1.salary === 0 && p2.salary === 0) return ['salary1', 'salary2'];
  const missing: SplitField[] = [];
  if (p1.salary === null) missing.push('salary1');
  if (p2.salary === null) missing.push('salary2');
  return missing;
}

/** Call only on a form with no missing field. */
export function toSplitInput(form: SplitForm): SplitInput {
  const person = (p: PersonForm) => ({ ...p, salary: p.salary ?? 0 });
  return {
    people: { p1: person(form.people.p1), p2: person(form.people.p2) },
    bill: form.bill,
  };
}
