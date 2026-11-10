import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageKey } from '../../shared/i18n/fr';
import { I18nService } from '../../shared/i18n/i18n.service';
import { RichText } from '../../shared/rich-text/rich-text';

@Component({
  selector: 'app-mortgage-pedagogy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, RouterLink],
  templateUrl: './mortgage-pedagogy.html',
})
export class MortgagePedagogy {
  readonly i18n = inject(I18nService);
  readonly lessons = LESSONS;
}

const LESSONS: { title: MessageKey; body: MessageKey }[] = [
  { title: 'mortgage.learn.decreasing.title', body: 'mortgage.learn.decreasing.body' },
  { title: 'mortgage.learn.amount.title', body: 'mortgage.learn.amount.body' },
  { title: 'mortgage.learn.questions.title', body: 'mortgage.learn.questions.body' },
  { title: 'mortgage.learn.order.title', body: 'mortgage.learn.order.body' },
  { title: 'mortgage.learn.limits.title', body: 'mortgage.learn.limits.body' },
];
