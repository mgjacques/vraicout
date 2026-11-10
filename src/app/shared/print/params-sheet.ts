import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

export interface ParamsGroup {
  title: string;
  rows: { label: string; value: string }[];
}

/** The figures behind a printed page, as label and value. Shown on paper only. */
@Component({
  selector: 'app-params-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'print-only' },
  template: `
    <section class="block print-params">
      <h2>{{ i18n.t('print.params.title') }}</h2>
      <div class="print-params-groups">
        @for (group of groups(); track group.title) {
          <table>
            <caption>
              {{
                group.title
              }}
            </caption>
            <tbody>
              @for (row of group.rows; track row.label) {
                <tr>
                  <th scope="row">{{ row.label }}</th>
                  <td>{{ row.value }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </section>
  `,
})
export class ParamsSheet {
  readonly i18n = inject(I18nService);
  readonly groups = input.required<ParamsGroup[]>();
}
