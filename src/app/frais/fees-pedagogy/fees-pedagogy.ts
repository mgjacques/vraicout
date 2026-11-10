import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { RichText } from '../../shared/rich-text/rich-text';

@Component({
  selector: 'app-fees-pedagogy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, RouterLink],
  templateUrl: './fees-pedagogy.html',
})
export class FeesPedagogy {
  readonly i18n = inject(I18nService);
  readonly lessons = LESSONS;
}

const LESSONS: { title: MessageKey; body: MessageKey }[] = [
  { title: 'fees.learn.mer.title', body: 'fees.learn.mer.body' },
  { title: 'fees.learn.where.title', body: 'fees.learn.where.body' },
  { title: 'fees.learn.advisor.title', body: 'fees.learn.advisor.body' },
  { title: 'fees.learn.compound.title', body: 'fees.learn.compound.body' },
  { title: 'fees.learn.value.title', body: 'fees.learn.value.body' },
];
