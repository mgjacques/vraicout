// Écrit src/app/shared/seo/build-branch.ts : la branche Git bâtie.
// Sur Cloudflare (Workers Builds), elle vient de WORKERS_CI_BRANCH ; en local, de Git.
// Seul un build de master est indexé par les moteurs de recherche et renvoie à la doc de master
// (voir src/app/shared/seo/site.ts). Le fichier généré est ignoré par Git.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const target = new URL('../src/app/shared/seo/build-branch.ts', import.meta.url);

function gitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

const branch = (process.env.WORKERS_CI_BRANCH ?? '').trim() || gitBranch();

const content = `// Généré par scripts/build-branch.mjs. Ne pas modifier.
export const BUILD_BRANCH: string = ${JSON.stringify(branch)};
`;

let current = '';
try {
  current = readFileSync(target, 'utf8');
} catch {}

// Réécrire seulement si ça change, pour ne pas relancer le serveur de dev pour rien.
if (current !== content) writeFileSync(target, content);

console.log(
  branch === 'master'
    ? 'Branche bâtie : master, le site sera indexé.'
    : `Branche bâtie : ${branch || 'inconnue'}, le site demandera de ne pas être indexé.`,
);
