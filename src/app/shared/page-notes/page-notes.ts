import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The lines a tool page ends with (where its figures stay, what it is not), above the site footer. */
@Component({
  selector: 'app-page-notes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-notes"><ng-content /></div>`,
})
export class PageNotes {}
