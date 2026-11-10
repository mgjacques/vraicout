/**
 * The public address and whether search engines may list it. No Angular here:
 * `scripts/site-files.mjs` reads this file too, after the build.
 */
import { BUILD_BRANCH } from './build-branch';

/** The public address, without a trailing slash: canonical links, the sitemap, the share tags. */
export const SITE_URL = 'https://vraicout.ca';

/** The branch Cloudflare serves at SITE_URL. Every other build is a preview. */
export const PUBLIC_BRANCH = 'master';

/** A preview (develop, a pull request) asks search engines to stay away; only master is listed. */
export const NOINDEX = BUILD_BRANCH !== PUBLIC_BRANCH;

/** The docs the method pages link to: master's on the public site, develop's on a preview. */
export const DOCS_BRANCH = NOINDEX ? 'develop' : PUBLIC_BRANCH;
