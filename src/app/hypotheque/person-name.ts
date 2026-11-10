import { I18nService } from '../shared/i18n/i18n.service';
import { PersonId } from './engine/types';

/** The name typed for a borrower, or "Personne 1" / "Personne 2" until one is. */
export function personName(i18n: I18nService, label: string, id: PersonId): string {
  return label.trim() || i18n.t(id === 'p1' ? 'mortgage.person.p1' : 'mortgage.person.p2');
}
