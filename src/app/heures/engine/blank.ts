import { PayForm, PERIODS } from '../../shared/engine/pay';
import { Recurrence, WorkInput } from './types';

/** The hours page form. Null means the person emptied the field. */
export interface WorkForm extends PayForm {
  hoursPerWeek: number | null;
  workCosts: number | null;
  price: number | null;
  recurrence: Recurrence;
  addTax: boolean;
}

/** Fields without which the hours mean nothing; `workCosts` when they eat the whole pay. */
export type WorkField = 'salary' | 'hoursPerWeek' | 'price' | 'workCosts';

/** A common net pay and a phone, so the first screen already says something. */
export function defaultWorkForm(): WorkForm {
  return {
    frequency: 'biweekly',
    salary: 2_000,
    hoursPerWeek: 37.5,
    workCosts: null,
    price: 1_400,
    recurrence: 'once',
    addTax: true,
  };
}

/** A pay or hours of 0 give no hourly wage; a price of 0 is allowed. */
export function missingWorkFields(form: WorkForm): WorkField[] {
  const missing: WorkField[] = [];
  if (!form.salary) missing.push('salary');
  if (!form.hoursPerWeek) missing.push('hoursPerWeek');
  if (form.price === null) missing.push('price');
  if (
    form.salary &&
    form.workCosts &&
    form.workCosts * 12 >= form.salary * PERIODS[form.frequency]
  ) {
    missing.push('workCosts');
  }
  return missing;
}

/** Call only on a form with no missing field. */
export function toWorkInput(form: WorkForm): WorkInput {
  return {
    frequency: form.frequency,
    salary: form.salary ?? 0,
    hoursPerWeek: form.hoursPerWeek ?? 0,
    workCosts: form.workCosts ?? 0,
    price: form.price ?? 0,
    recurrence: form.recurrence,
    addTax: form.addTax,
  };
}
