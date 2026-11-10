import { ALL_TOOL_CATALOGS, loadCatalog } from './app/shared/i18n/catalogs';

// In the app, each tool's texts load with its route. Tests render components directly: load them all.
await Promise.all(ALL_TOOL_CATALOGS.map(loadCatalog));
