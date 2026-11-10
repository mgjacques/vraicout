import { MessageKey } from './i18n/fr';

/** A theme gathers the tools by the question they help with, not by their form. */
export type ToolTheme = 'everyday' | 'savings';

export interface Tool {
  path: string;
  theme: ToolTheme;
  icon: string;
  short: MessageKey;
  title: MessageKey;
  body: MessageKey;
  /** The date line of the tool's /methode page, for a tool that has one. */
  methodUpdated?: MessageKey;
}

/** Every tool of the app, in display order: the header and the landing page list them by group. */
export const TOOLS: readonly Tool[] = [
  {
    path: '/partage',
    theme: 'everyday',
    icon: 'pi-users',
    short: 'tool.split.short',
    title: 'tool.split.title',
    body: 'tool.split.body',
    methodUpdated: 'split.method.updated',
  },
  {
    path: '/heures',
    theme: 'everyday',
    icon: 'pi-clock',
    short: 'tool.hours.short',
    title: 'tool.hours.title',
    body: 'tool.hours.body',
    methodUpdated: 'hours.method.updated',
  },
  {
    path: '/depenses',
    theme: 'everyday',
    icon: 'pi-replay',
    short: 'tool.spending.short',
    title: 'tool.spending.title',
    body: 'tool.spending.body',
    methodUpdated: 'spending.method.updated',
  },
  {
    path: '/impot',
    theme: 'savings',
    icon: 'pi-calculator',
    short: 'tool.marginal.short',
    title: 'tool.marginal.title',
    body: 'tool.marginal.body',
    methodUpdated: 'marginal.method.updated',
  },
  {
    path: '/epargne',
    theme: 'savings',
    icon: 'pi-chart-line',
    short: 'tool.savings.short',
    title: 'tool.savings.title',
    body: 'tool.savings.body',
    methodUpdated: 'savings.method.updated',
  },
  {
    path: '/frais',
    theme: 'savings',
    icon: 'pi-percentage',
    short: 'tool.fees.short',
    title: 'tool.fees.title',
    body: 'tool.fees.body',
    methodUpdated: 'fees.method.updated',
  },
  {
    path: '/assurance',
    theme: 'savings',
    icon: 'pi-shield',
    short: 'tool.insurance.short',
    title: 'tool.insurance.title',
    body: 'tool.insurance.body',
    methodUpdated: 'insurance.method.updated',
  },
  {
    path: '/hypotheque',
    theme: 'savings',
    icon: 'pi-home',
    short: 'tool.mortgage.short',
    title: 'tool.mortgage.title',
    body: 'tool.mortgage.body',
    methodUpdated: 'mortgage.method.updated',
  },
];

/** The tools with a /methode page, in display order: the /sources index lists them. */
export const METHOD_TOOLS = TOOLS.filter((tool) => tool.methodUpdated);

export interface ToolGroup {
  theme: ToolTheme;
  /** Where the landing page's section for this group starts. */
  anchor: string;
  label: MessageKey;
  tools: readonly Tool[];
}

function group(theme: ToolTheme, anchor: string, label: MessageKey): ToolGroup {
  return { theme, anchor, label, tools: TOOLS.filter((tool) => tool.theme === theme) };
}

/** The tools by theme, everyday first: the header, the menu and the landing page show them so. */
export const TOOL_GROUPS: readonly ToolGroup[] = [
  group('everyday', 'quotidien', 'tool.group.everyday'),
  group('savings', 'epargne-assurances', 'tool.group.savings'),
];
