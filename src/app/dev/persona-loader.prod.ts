import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

/** Production stand-in for persona-loader.ts: the personas never ship. */
export function providePersonaLoader(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
