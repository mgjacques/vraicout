// After `ng build`: one HTML file per address, with its own title, description, share tags and
// canonical link, so a shared link shows the right page even to a service that runs no script.
// Also writes 404.html, sitemap.xml, robots.txt, site.webmanifest and _headers (security headers,
// with the hash of each inline script for the Content-Security-Policy).
//
// The pages, the texts and the address come from the app itself (src/app/shared/seo/), bundled
// here with the esbuild that ships with Angular's build tools.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist/vraicout/browser');

/** A 1200 × 630 image in public/ under this name becomes the picture of every shared link. */
const SHARE_IMAGE = 'share.png';

const bundled = await build({
  stdin: {
    contents: `
      export { SITE_PAGES, pageHead } from './src/app/shared/seo/pages';
      export { SITE_URL, NOINDEX } from './src/app/shared/seo/site';
      export { APP_NAME } from './src/app/shared/app-name';
      export { fr } from './src/app/shared/i18n/fr';
    `,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'error',
});
const { SITE_PAGES, pageHead, SITE_URL, NOINDEX, APP_NAME, fr } = await import(
  'data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64')
);
const t = (key) => fr[key];

const template = await readFile(join(out, 'index.html'), 'utf8');
const hasShareImage = existsSync(join(out, SHARE_IMAGE));
const themeColor = template.match(/<meta name="theme-color" content="([^"]+)"/)?.[1] ?? '#ffffff';

const attr = (text) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** index.html with the head of one page. */
function render(head, noindex) {
  const tags = [
    `<link rel="manifest" href="site.webmanifest">`,
    head.canonical && `<link rel="canonical" href="${attr(head.canonical)}">`,
    noindex && `<meta name="robots" content="noindex">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${attr(APP_NAME)}">`,
    `<meta property="og:locale" content="fr_CA">`,
    `<meta property="og:title" content="${attr(head.shareTitle)}">`,
    `<meta property="og:description" content="${attr(head.description)}">`,
    head.canonical && `<meta property="og:url" content="${attr(head.canonical)}">`,
    hasShareImage && `<meta property="og:image" content="${SITE_URL}/${SHARE_IMAGE}">`,
    hasShareImage && `<meta property="og:image:width" content="1200">`,
    hasShareImage && `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="${hasShareImage ? 'summary_large_image' : 'summary'}">`,
  ].filter(Boolean);

  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${attr(head.title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${attr(head.description)}">\n    ${tags.join('\n    ')}`,
  );
  if (!html.includes('og:title')) throw new Error('index.html: description meta tag not found');
  return html;
}

/** `/frais/methode` → frais/methode.html, which Cloudflare serves at /frais/methode. */
const fileFor = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);

for (const page of SITE_PAGES) {
  const head = pageHead(page, t);
  const file = join(out, fileFor(page.path));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, render(head, NOINDEX || !head.canonical));
}

// Any other address: the app shell, which shows « Cette page n'existe pas », with a real 404 status.
await writeFile(join(out, '404.html'), render(pageHead(undefined, t), true));

const listed = SITE_PAGES.filter((page) => page.description);
await writeFile(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listed.map((page) => `  <url><loc>${SITE_URL}${page.path}</loc></url>`).join('\n')}
</urlset>
`,
);

await writeFile(
  join(out, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);

await writeFile(
  join(out, 'site.webmanifest'),
  JSON.stringify(
    {
      name: APP_NAME,
      short_name: APP_NAME,
      lang: 'fr-CA',
      start_url: '/',
      display: 'standalone',
      background_color: '#fffdf8',
      theme_color: themeColor,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
);

// Every inline script of the page (theme before the first paint, stylesheet loader), by hash:
// the policy then refuses any other inline script.
const inlineScripts = [...template.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
  ([, body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`,
);

// Cloudflare Web Analytics: its script, and where it sends the visit count (see the privacy page).
const ANALYTICS_SCRIPT = 'https://static.cloudflareinsights.com';
const ANALYTICS_REPORT = 'https://cloudflareinsights.com';

const policy = [
  `default-src 'self'`,
  `script-src 'self' ${inlineScripts.join(' ')} ${ANALYTICS_SCRIPT}`,
  // PrimeNG and Chart.js set styles from the scripts.
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${ANALYTICS_REPORT}`,
  `manifest-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join('; ');

await writeFile(
  join(out, '_headers'),
  `/*
  Content-Security-Policy: ${policy}
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()
  Cross-Origin-Opener-Policy: same-origin

# Names that carry a hash of their content: they never change, the browser keeps them.
/main-*
  Cache-Control: public, max-age=31536000, immutable
/chunk-*
  Cache-Control: public, max-age=31536000, immutable
/styles-*
  Cache-Control: public, max-age=31536000, immutable
/media/*
  Cache-Control: public, max-age=31536000, immutable
`,
);

console.log(
  `site-files: ${SITE_PAGES.length} pages (${listed.length} in the sitemap), 404.html, sitemap.xml, robots.txt, site.webmanifest, _headers` +
    (hasShareImage ? '' : ` (no public/${SHARE_IMAGE}: shared links have no picture)`) +
    (NOINDEX ? ' — NOINDEX is on' : ''),
);
