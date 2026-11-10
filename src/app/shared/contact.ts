import { DOCS_BRANCH } from './seo/site';

/**
 * The address, reversed: it never appears whole in the sources nor in the bundle,
 * so harvesters scanning the files for « x@y.z » find nothing. The browser rebuilds it.
 */
const REVERSED_ADDRESS = 'em.mp@tuociarv';

/** The contact address: the footer and the privacy page show it. */
export const CONTACT_ADDRESS = [...REVERSED_ADDRESS].reverse().join('');

/** Where the code lives, open to anyone: the footer links to it. */
export const SOURCE_URL = 'https://github.com/mgjacques/vraicout';

/** A calculation model on GitHub, on the branch this build comes from: `modele-de-calcul.md`. */
export function modelUrl(file: string): string {
  return `${SOURCE_URL}/blob/${DOCS_BRANCH}/docs/${file}`;
}
