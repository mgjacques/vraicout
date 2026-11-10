/**
 * The address, reversed: it never appears whole in the sources nor in the bundle,
 * so harvesters scanning the files for « x@y.z » find nothing. The browser rebuilds it.
 */
const REVERSED_ADDRESS = 'em.mp@tuociarv';

/** The contact address: the footer and the privacy page show it. */
export const CONTACT_ADDRESS = [...REVERSED_ADDRESS].reverse().join('');

/** Where the code lives, open to anyone: the footer links to it. */
export const SOURCE_URL = 'https://github.com/mgjacques/vraicout';
