/**
 * The public address and whether search engines may list it. No Angular here:
 * `scripts/site-files.mjs` reads this file too, after the build.
 */

/** The public address, without a trailing slash: canonical links, the sitemap, the share tags. */
export const SITE_URL = 'https://vraicout.ca';

/** Not public yet: search engines are asked to stay away. Replace with false on launch day. */
export const NOINDEX = true;
