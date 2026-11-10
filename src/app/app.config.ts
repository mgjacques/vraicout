import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  PreloadAllModules,
  TitleStrategy,
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { CatalogTitleStrategy, routes } from './app.routes';
import { providePersonaLoader } from './dev/persona-loader';
import { PRIME_LICENSE } from './prime-license';

const VraiCout = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{teal.50}',
      100: '{teal.100}',
      200: '{teal.200}',
      300: '{teal.300}',
      400: '{teal.400}',
      500: '{teal.600}',
      600: '{teal.700}',
      700: '{teal.800}',
      800: '{teal.900}',
      900: '{teal.950}',
      950: '{teal.950}',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '{stone.50}',
          100: '{stone.100}',
          200: '{stone.200}',
          300: '{stone.300}',
          400: '{stone.400}',
          500: '{stone.500}',
          600: '{stone.600}',
          700: '{stone.700}',
          800: '{stone.800}',
          900: '{stone.900}',
          950: '{stone.950}',
        },
        // Fields sit on cards: the default near-black stood out too much.
        formField: { background: '{surface.900}' },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // The tools are small: fetched once the first page is up, they open without a wait.
      withPreloading(PreloadAllModules),
    ),
    { provide: TitleStrategy, useClass: CatalogTitleStrategy },
    // `?persona=<id>` loads a test persona; empty in production (angular.json fileReplacements).
    providePersonaLoader(),
    providePrimeNG({
      ...(PRIME_LICENSE ? { license: PRIME_LICENSE } : {}),
      theme: {
        preset: VraiCout,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
  ],
};
