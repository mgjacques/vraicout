import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MessageKey } from '../i18n/fr';
import { I18nService } from '../i18n/i18n.service';
import { TOOL_GROUPS } from '../tools';

const PAGES: Record<'intro' | 'method', MessageKey> = {
  intro: 'breadcrumb.intro',
  method: 'method.title',
};

/**
 * Above a tool page's title: home, the tool's group, the tool, then the page when it is not the
 * results. The last step is the current page, never a link.
 */
@Component({
  selector: 'app-tool-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, RouterLink],
  template: `
    <p-breadcrumb
      styleClass="tool-breadcrumb print-omit"
      [model]="items()"
      [pt]="{ root: { 'aria-label': i18n.t('breadcrumb.label') } }"
    >
      <ng-template #item let-item>
        @if (item.routerLink) {
          <a [routerLink]="item.routerLink">{{ item.label }}</a>
        } @else if (item.state?.current) {
          <span aria-current="page">{{ item.label }}</span>
        } @else {
          <span>{{ item.label }}</span>
        }
      </ng-template>
    </p-breadcrumb>
  `,
})
export class ToolBreadcrumb {
  readonly i18n = inject(I18nService);
  /** The tool's path, as in TOOLS. */
  readonly tool = input.required<string>();
  /** The page under the tool; none for the results. */
  readonly page = input<'intro' | 'method'>();

  readonly items = computed<MenuItem[]>(() => {
    const group = TOOL_GROUPS.find((g) => g.tools.some((t) => t.path === this.tool()));
    const tool = group?.tools.find((t) => t.path === this.tool());
    if (!group || !tool) throw new Error(`Unknown tool: ${this.tool()}`);
    const page = this.page();
    const items: MenuItem[] = [
      { label: this.i18n.t('shell.navHome'), routerLink: '/' },
      { label: this.i18n.t(group.label) },
      page
        ? { label: this.i18n.t(tool.short), routerLink: tool.path }
        : { label: this.i18n.t(tool.short), state: { current: true } },
    ];
    if (page) items.push({ label: this.i18n.t(PAGES[page]), state: { current: true } });
    return items;
  });
}
