# Déploiement

Comment le site est bâti et servi : la clé PrimeUI, l'hébergement sur Cloudflare et les fichiers écrits après le build.

## Clé PrimeUI

La clé n'est pas dans le dépôt. `scripts/prime-license.mjs` génère `src/app/prime-license.ts` (ignoré par Git) à partir de la variable d'environnement `PRIME_LICENSE`, avant `npm install`, `npm start`, `npm run build` et `npm run watch`.

- En local : créer un fichier `.env` (ignoré par Git) contenant `PRIME_LICENSE=…`, ou exporter la variable dans le shell.
- Au déploiement : définir `PRIME_LICENSE` comme variable **de build** (sur Cloudflare : Settings → Build → Variables and secrets), pas comme variable du Worker, que le build ne voit pas.

Sans clé, tout fonctionne, mais PrimeNG affiche un bandeau « Invalid PrimeUI License ». La clé reste lisible dans le JS livré au navigateur : c'est le cas de toute licence de bibliothèque front-end, le but est seulement qu'elle ne vive pas dans le code.

## Cloudflare

Un Worker Cloudflare, configuré dans `wrangler.jsonc`, sert `dist/vraicout/browser`. Dans Workers Builds : commande de build `npm run build`, commande de déploiement `npx wrangler deploy`, et la variable de build `PRIME_LICENSE`. `master` est la production ; les autres branches (`develop`, les PR) sont des aperçus.

Tout autre hébergement statique convient s'il sert `/frais/methode` à partir de `frais/methode.html`, et `404.html` avec un statut 404 pour toute autre adresse.

## Branche bâtie et indexation

Seul un build de `master` est indexé par les moteurs de recherche. `scripts/build-branch.mjs`, lancé avec la clé PrimeUI, écrit la branche bâtie dans `src/app/shared/seo/build-branch.ts` (ignoré par Git). Elle vient de `WORKERS_CI_BRANCH` sur Cloudflare, de Git en local.

Sur toute autre branche, `NOINDEX` (`shared/seo/site.ts`) est vrai : chaque page demande aux moteurs de recherche de ne pas l'indexer, et les liens vers les modèles de calcul pointent vers la doc de `develop` plutôt que celle de `master`. Le journal du build dit quelle branche il a lue.

## Fichiers écrits après le build

`npm run build` lance ensuite `scripts/site-files.mjs` (`postbuild`), qui lit `src/app/shared/seo/` et écrit dans `dist/vraicout/browser` :

- un fichier HTML par adresse de `SITE_PAGES` (`frais.html`, `frais/methode.html`…), avec son titre, sa description, son aperçu de lien (Open Graph) et son lien canonique : un lien partagé montre la bonne page même là où aucun script ne s'exécute ;
- `404.html`, l'app elle-même, servie avec un statut 404 pour toute adresse inconnue ;
- `sitemap.xml` (les pages qui ont une description), `robots.txt` et `site.webmanifest` ;
- `_headers` : les en-têtes de sécurité (dont la politique de sécurité du contenu, avec l'empreinte de chaque script en ligne de `index.html`) et la mise en cache longue des fichiers dont le nom porte une empreinte.

## Statistiques de visite

La politique de sécurité du contenu n'autorise qu'une adresse externe : Cloudflare Web Analytics, son script (`static.cloudflareinsights.com`) et l'adresse où il envoie le décompte des visites (`cloudflareinsights.com`). Il ne voit aucun chiffre entré dans les outils. La page de confidentialité le décrit (`privacy.collected.analytics`, dans `shared/i18n/fr/privacy.ts`) : changer d'outil de statistiques, ou en ajouter un, change cette page et `scripts/site-files.mjs` dans le même changement.

Le domaine est dans `shared/seo/site.ts` (`SITE_URL`).

`ng serve` ne passe pas par ce script : en local, toutes les adresses servent le même `index.html`, et l'app met ses métas à jour en naviguant.

## Images

L'image de 1200 × 630 de `public/share.png` devient l'image de tous les liens partagés. Elle vient de `scripts/share-image/share.html`, photographiée par Chrome sans interface :

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot="$PWD/public/share.png" "file://$PWD/scripts/share-image/share.html"
```

Les icônes PNG de `public/` viennent de `scripts/icons/app-icon.svg` :

```bash
sips -s format png -z 180 180 scripts/icons/app-icon.svg --out public/apple-touch-icon.png
```

Et de même en 192 et 512 pour `icon-192.png` et `icon-512.png`. Le nom du site est défini dans `src/app/shared/app-name.ts` ; le logo, une étiquette de prix en deux moitiés, dans `src/app/shell/brand-mark.ts` et `public/favicon.svg`.
