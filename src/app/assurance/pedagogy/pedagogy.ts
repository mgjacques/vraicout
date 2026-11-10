import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { formatAge } from '../../shared/engine/formulas';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { RichText } from '../../shared/rich-text/rich-text';
import { ScenarioStore } from '../state/scenario.store';

@Component({
  selector: 'app-pedagogy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, AccordionModule, RouterLink],
  templateUrl: './pedagogy.html',
})
export class Pedagogy {
  readonly store = inject(ScenarioStore);
  readonly i18n = inject(I18nService);
  readonly glossary = GLOSSARY;

  readonly paidUp = computed(() =>
    this.store.projection().assumptions.premiumMonths === 0
      ? this.i18n.t('pedagogy.paidup.done')
      : this.i18n.t('pedagogy.paidup.body', {
          premiumYears: formatAge(this.store.input().permanent.premiumYearsRemaining),
          paidUpAge: formatAge(this.store.projection().paidUpAge),
        }),
  );
}

const GLOSSARY_TERMS = [
  'permanent',
  'term',
  'premium',
  'face',
  'cash',
  'dividends',
  'paidUpAdditions',
  'paidUp',
  'reducedPaidUp',
  'extended',
  'netCash',
  'loan',
  'acb',
  'contestability',
  'conversion',
  'tfsa',
  'rrsp',
  'marginal',
  'return',
  'inflation',
] as const;

const GLOSSARY = GLOSSARY_TERMS.map((term) => ({
  id: term,
  title: `glossary.${term}.title` as MessageKey,
  body: `glossary.${term}.body` as MessageKey,
}));
