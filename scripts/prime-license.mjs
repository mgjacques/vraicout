// Écrit src/app/prime-license.ts à partir de la variable d'environnement PRIME_LICENSE
// (ou du fichier .env, chargé par `node --env-file-if-exists=.env`).
// Le fichier généré est ignoré par Git : la clé ne vit jamais dans le dépôt.
// Elle reste lisible dans le JS livré au navigateur, comme toute licence front-end.
import { readFileSync, writeFileSync } from 'node:fs';

const target = new URL('../src/app/prime-license.ts', import.meta.url);
const key = (process.env.PRIME_LICENSE ?? '').trim();

const content = `// Généré par scripts/prime-license.mjs à partir de PRIME_LICENSE. Ne pas modifier.
export const PRIME_LICENSE = ${JSON.stringify(key)};
`;

let current = '';
try {
  current = readFileSync(target, 'utf8');
} catch {}

// Réécrire seulement si ça change, pour ne pas relancer le serveur de dev pour rien.
if (current !== content) writeFileSync(target, content);

console.log(
  key
    ? 'Clé PrimeUI : présente.'
    : 'Clé PrimeUI : absente (PRIME_LICENSE vide), le bandeau de licence s’affichera.',
);
