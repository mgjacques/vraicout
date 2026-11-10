# CLAUDE.md

VraiCoût : des outils web gratuits, sans inscription, qui calculent combien ça coûte, pour vrai. Angular 22 entièrement statique, PrimeNG 22, Chart.js, Vitest. Chaque **outil** (`assurance`, `frais`, `hypotheque`, `partage`, `heures`, `depenses`, `epargne`, `impot`) a son dossier sous `src/app/`. Vue d'ensemble dans le [README](README.md), détails dans [docs/architecture.md](docs/architecture.md).

## Commandes

```bash
npm start                    # http://localhost:4200
npx ng test --watch=false    # tests, une seule passe (npm test reste en mode surveillance)
npm run build                # sortie dans dist/vraicout/browser
npx prettier --write "src/**/*.{ts,html}"
```

Sans `PRIME_LICENSE` (dans `.env`), PrimeNG affiche un bandeau de licence : c'est normal en local, ce n'est pas un bogue.

## Principes à ne jamais casser

- **Rien ne quitte le navigateur.** Aucun appel réseau, aucun serveur, aucun traceur. Ce qui est gardé l'est dans `localStorage` via `shared/storage/`, et toute nouvelle donnée gardée s'ajoute à la page de confidentialité (`shared/i18n/fr/privacy.ts`). En production, la politique de sécurité du contenu (`scripts/site-files.mjs`) bloque toute adresse externe autre que Cloudflare Web Analytics.
- **Chaque route est dans `SITE_PAGES`** (`shared/seo/pages.ts`), avec le même titre : le build en tire un fichier HTML par adresse, le sitemap et les aperçus de lien. Un test le vérifie.
- **Éducatif, jamais un conseil.** L'outil compare et dit ce que donnent les chiffres entrés ; il ne recommande ni produit ni option (cadre de l'AMF).
- **Les formules affichées sont les formules exécutées.** Chaque montant porte son explication, produite à partir des mêmes valeurs que le calcul. Un nouveau montant affiché a donc sa phrase `formula.*` et un test qui la vérifie.
- **Comparaison à égalité** entre les options (même budget, mêmes dépôts, mêmes années), décrite dans le modèle de calcul de chaque outil.

## Code

- **Moteurs purs.** `src/app/<outil>/engine/` ne dépend pas d'Angular et est entièrement testé. Tout calcul y va, jamais dans un composant.
- **Un outil n'importe jamais un autre outil.** Ce qui doit être partagé passe dans `src/app/shared/` (impôt, inflation, paie, montants, champs numériques…).
- **Bornes des champs** : un seul endroit par outil, `engine/limits.ts` (le salaire : `shared/engine/pay.ts`). Pas de nombre en dur ailleurs. Mettre à jour [docs/limites-des-champs.md](docs/limites-des-champs.md) avec.
- Composants autonomes, signaux, sans zone. Tout composant d'interface vient de PrimeNG.
- Une seule feuille de style globale, `src/styles.css`, avec ses variables de couleur. Une couleur de série de graphique ne colore jamais du texte. Aucun défilement horizontal de 320 à 1920 px.
- Les commentaires et les noms dans le code sont en anglais ; la doc, l'interface et les messages de commit sont en français.

## Textes de l'interface

Les règles complètes sont dans [docs/redaction.md](docs/redaction.md) ; les lire avant de toucher à un texte.

- Aucun texte en dur dans un gabarit, unités comprises : tout passe par `i18n.t('clé', { param })`, avec des clés typées.
- Les chaînes sont dans `src/app/shared/i18n/fr/`, un fichier par outil (`common.ts` si deux outils s'en servent). `en.ts` reprend les clés françaises tout seul, vides : rien à y ajouter.
- Vouvoiement, langage courant, formulations épicènes, vocabulaire imposé par la table de `redaction.md`.
- Les règles ne pèsent pas pareil partout (section « Portée » de `redaction.md`). Dans les outils et les pages d'information : phrases courtes, et chaque texte relu contre la section « À éviter ». Les pages de présentation (accueil, « À propos ») ont un ton plus libre, et le texte qu'écrit la personne qui fait le site se garde tel quel.
- Gras (`**…**`) au plus une fois par texte, pour une mise en garde ou l'endroit où trouver un chiffre ; italique (`*…*`) seulement pour un mot étranger ou un titre de document. Affichage avec `<app-rich-text>`.
- Ne jamais présenter comme garanti ce qui ne l'est pas. N'ajouter à `SOURCES` qu'une adresse vérifiée.

## Ajouter ou modifier un outil

Pour un nouvel outil, suivre le skill `nouvel-outil` (`.claude/skills/nouvel-outil/`) : il liste chaque fichier à créer ou à toucher. Un chiffre qui change d'une année à l'autre (impôt, normes de projection, taxes…) s'inscrit dans [docs/chiffres-annuels.md](docs/chiffres-annuels.md), avec chaque endroit qui le recopie. Un changement de calcul dans un outil existant met à jour `docs/modele-de-calcul-<outil>.md` (`modele-de-calcul.md` pour l'assurance) et ses tests. Si la page Méthode de l'outil montre ce calcul en notation mathématique (les gabarits `*-formula.html` de `<outil>/method/`), la formule MathML et la liste de ses symboles se mettent à jour dans le même changement : elles sont écrites à la main, aucun test ne les compare au moteur, et un écart ne se verrait pas.

## Avant de dire qu'un changement est fini

1. `npx ng test --watch=false` passe.
2. `npm run build` passe.
3. Pour un changement visible, vérifier la page dans le navigateur, sur mobile comme sur grand écran.
4. La doc touchée (modèle de calcul, limites, architecture, déploiement, README) est à jour.

## Git

- On travaille sur `develop` ; `master` est la branche principale.
- Messages de commit en français, courts, qui disent le changement du point de vue de la personne qui utilise le site (« Partage des dépenses : la facture à côté du résultat »).
- `ressources-contexte/`, `ideas/` (idées d'outils mises de côté), `.env`, `src/app/prime-license.ts`, `src/app/shared/seo/build-branch.ts` et `.claude/` (sauf `.claude/skills/`) sont ignorés par Git : ne jamais les ajouter. Les skills du projet, eux, sont suivis et se commitent avec le changement qui les touche.
