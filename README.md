# VraiCoût

**Combien ça coûte, pour vrai ? VraiCoût le calcule avec vos chiffres, aujourd'hui et dans le temps.**

Des outils web publics, gratuits et sans inscription. Ils rendent visibles les coûts qui paraissent petits sur le moment, mais pèsent lourd quand on les additionne sur des années ou qu'on les compte en heures de travail : frais de placement, primes d'assurance, dépenses. Il y a huit **outils** :

- **Assurance vie** (`/assurance`) : une assurance vie permanente (déjà en place ou proposée), ou une temporaire et la différence de prime placée. Pour chaque option, les primes payées, ce que les proches recevraient en cas de décès, et ce qu'il resterait en main si la personne est en vie.
- **Frais de gestion** (`/frais`) : deux placements, mêmes dépôts, même rendement avant frais ; ce que les frais (RFG et frais de conseiller) coûtent à la retraite, et en revenu de retraite.
- **Assurance hypothécaire** (`/hypotheque`) : une assurance temporaire personnelle ou l'assurance vie hypothécaire de la banque, pour une personne ou un couple. Les primes payées pendant le prêt, la protection année après année, ce que chacune verse en cas de décès et à qui, et les différences qui ne se mesurent pas en dollars.
- **Partage des dépenses** (`/partage`) : la part de chaque personne dans les dépenses communes, au prorata de son revenu, brut ou net au choix. Salaire à l'année, au mois, deux fois par mois, aux deux semaines ou à la semaine.
- **Prix en heures de travail** (`/heures`) : un prix, payé une fois, chaque mois ou chaque année, converti en heures et en journées de travail selon la paie nette, après ce que le travail coûte (transport, garde…), taxes du Québec comprises au choix.
- **Dépenses fréquentes** (`/depenses`) : une dépense qui revient (X fois par jour, par semaine ou par mois, ou aux X jours, semaines ou mois), ramenée à l'année puis sur plusieurs années, prix qui montent au choix ; et son coût d'opportunité, ce que les mêmes sommes vaudraient placées chaque mois.
- **Taux marginal d'imposition** (`/impot`) : le taux d'impôt sur le prochain dollar gagné au Québec, fédéral et provincial, avec l'impôt de l'année, le taux moyen et ce qu'un revenu de plus laisse en main. Impôt sur le revenu seulement, taux et seuils de 2026.
- **Épargne dans le temps** (`/epargne`) : des dépôts mensuels pendant quelques années, puis des années de croissance sans dépôt ; ce que les intérêts composés ajoutent, et ce que coûte le fait de commencer plus tard.

Chaque montant affiche, au clic ou au survol, le calcul exact qui l'a produit.

Le nom, « VraiCoût », est défini à un seul endroit (`src/app/shared/app-name.ts`) ; le logo, une étiquette de prix en deux moitiés, est dans `src/app/shell/brand-mark.ts` et `public/favicon.svg`.

## Principes non négociables

- **Rien ne quitte le navigateur.** Pas de compte, pas de serveur. Les chiffres sont gardés dans le navigateur (`localStorage`), sur l'appareil seulement, pour la visite suivante ; le menu de l'avatar, en haut à droite, les efface, et la page `/donnees` les passe à un autre navigateur par un code que vous copiez vous-même.
- **Éducatif, pas un conseil.** Au Québec, le conseil en assurance est encadré par l'AMF. L'outil ne recommande aucun produit et le dit sur chaque page.
- **Les formules affichées sont les formules exécutées.** Le texte d'explication est produit à partir des mêmes valeurs que le calcul (voir [Modèle de calcul](docs/modele-de-calcul.md)).
- **Comparaison à égalité.** Assurance : les deux options coûtent la même chose chaque mois, l'option la moins chère place la différence. Frais : les deux placements reçoivent les mêmes dépôts et ont le même rendement avant frais. Hypothèque : les deux options sont comparées sur les mêmes années de prêt, avec les primes telles que soumises.
- **Langage courant.** Le public n'est pas du métier. Voir [Règles de rédaction](docs/redaction.md).

## Démarrer

Prérequis : Node.js 22.22.3 ou plus récent, exigé par Angular 22 ; la version du projet est dans `.nvmrc` (Node 24 LTS). Une version impaire fonctionne, mais Angular affiche un avertissement.

```bash
nvm use            # prend la version de .nvmrc
npm install
npm start          # http://localhost:4200
npm test           # tests Vitest, une seule passe : npx ng test --watch=false
npm run build      # sortie statique dans dist/vraicout/browser
```

### Clé PrimeUI

La clé n'est pas dans le dépôt. `scripts/prime-license.mjs` génère `src/app/prime-license.ts` (ignoré par Git) à partir de la variable d'environnement `PRIME_LICENSE`, avant `npm install`, `npm start`, `npm run build` et `npm run watch`.

- En local : créer un fichier `.env` (ignoré par Git) contenant `PRIME_LICENSE=…`, ou exporter la variable dans le shell.
- Au déploiement : définir `PRIME_LICENSE` comme variable **de build** (sur Cloudflare : Settings → Build → Variables and secrets), pas comme variable du Worker, que le build ne voit pas.

Sans clé, tout fonctionne, mais PrimeNG affiche un bandeau « Invalid PrimeUI License ». La clé reste lisible dans le JS livré au navigateur : c'est le cas de toute licence de bibliothèque front-end, le but est seulement qu'elle ne vive pas dans le code.

### Déploiement

Sur un Worker Cloudflare, configuré dans `wrangler.jsonc` : il sert `dist/vraicout/browser`. Dans Workers Builds : commande de build `npm run build`, commande de déploiement `npx wrangler deploy`, et la variable de build `PRIME_LICENSE` (voir plus haut). Tout autre hébergement statique convient s'il sert `/frais/methode` à partir de `frais/methode.html`, et `404.html` avec un statut 404 pour toute autre adresse.

### Fichiers écrits après le build

`npm run build` lance ensuite `scripts/site-files.mjs` (`postbuild`), qui lit `src/app/shared/seo/` et écrit dans `dist/vraicout/browser` :

- un fichier HTML par adresse de `SITE_PAGES` (`frais.html`, `frais/methode.html`…), avec son titre, sa description, son aperçu de lien (Open Graph) et son lien canonique : un lien partagé montre la bonne page même là où aucun script ne s'exécute ;
- `404.html`, l'app elle-même, servie avec un statut 404 pour toute adresse inconnue ;
- `sitemap.xml` (les pages qui ont une description), `robots.txt` et `site.webmanifest` ;
- `_headers` : les en-têtes de sécurité (dont la politique de sécurité du contenu, avec l'empreinte de chaque script en ligne de `index.html`) et la mise en cache longue des fichiers dont le nom porte une empreinte.

Le domaine est dans `shared/seo/site.ts` (`SITE_URL`), avec `NOINDEX`. Une image de 1200 × 630 déposée dans `public/share.png` devient l'image de tous les liens partagés ; sans elle, les aperçus n'ont pas d'image. Les icônes PNG de `public/` viennent de `scripts/icons/app-icon.svg` : `sips -s format png -z 180 180 scripts/icons/app-icon.svg --out public/apple-touch-icon.png` (et de même en 192 et 512 pour `icon-192.png` et `icon-512.png`).

`ng serve` ne passe pas par ce script : en local, toutes les adresses servent le même `index.html`, et l'app met ses métas à jour en naviguant.

## Pile technique

- Angular 22 (composants autonomes, signaux, détection de changements sans zone), sans rendu serveur.
- PrimeNG 22, thème Aura personnalisé, pour tous les composants d'interface.
- Chart.js, avec `chartjs-plugin-annotation` pour la ligne de fin de la temporaire.
- Vitest pour les tests.
- Prettier pour le format (`printWidth: 100`, apostrophes simples) : `npx prettier --write "src/**/*.{ts,html}"`.

## Organisation

| Dossier                    | Rôle                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/home/`            | L'accueil, qui liste les outils par groupe, puis « À propos ».                                                                                     |
| `src/app/shell/`           | L'en-tête et le pied de page communs, le menu mobile et le menu « Vos données ».                                                                   |
| `src/app/shared/`          | Ce qui sert à plusieurs outils : catalogue de textes, montants cliquables, impôt, inflation, paie, champs numériques, pied de page, écran d'accès. |
| `src/app/assurance/`       | L'outil assurance : moteur, état, accueil, profil en quatre étapes, comparaison.                                                                   |
| `src/app/frais/`           | L'outil frais de gestion : moteur, état, introduction, étapes, résultats.                                                                          |
| `src/app/hypotheque/`      | L'outil assurance hypothécaire : moteur, état, introduction, trois étapes, résultats.                                                              |
| `src/app/partage/`         | L'outil partage des dépenses : moteur, état, une seule page.                                                                                       |
| `src/app/heures/`          | L'outil prix en heures de travail : moteur, état, une seule page.                                                                                  |
| `src/app/depenses/`        | L'outil dépenses fréquentes : moteur, état, une seule page.                                                                                        |
| `src/app/impot/`           | L'outil taux marginal d'imposition : moteur, état, une seule page avec son graphique.                                                              |
| `src/app/epargne/`         | L'outil épargne dans le temps : moteur, état, une seule page avec son graphique.                                                                   |
| `src/app/ressources/`      | La page « Pour aller plus loin » (`/ressources`), une liste de lecture.                                                                            |
| `src/app/confidentialite/` | La page de confidentialité (`/confidentialite`), liée dans le pied de page.                                                                        |
| `src/app/donnees/`         | La page « Exporter ou importer vos données » (`/donnees`), liée dans le menu de l'avatar, le menu mobile et le pied de page.                       |
| `ressources-contexte/`     | Le cahier des charges d'origine et l'artefact v2 dont la mécanique est tirée.                                                                      |

Chaque moteur (`*/engine/`) est pur, sans Angular, et entièrement testé. Détails et marche à suivre pour ajouter un outil dans [Architecture](docs/architecture.md).

## Documentation

- [Architecture](docs/architecture.md) : outils, pages, état, formulaires, composants, choix de mise en page.
- [Modèle de calcul : assurance](docs/modele-de-calcul.md) : chaque règle du moteur, ses hypothèses et ses limites.
- [Modèle de calcul : frais de gestion](docs/modele-de-calcul-frais.md).
- [Modèle de calcul : assurance hypothécaire](docs/modele-de-calcul-hypotheque.md).
- [Modèle de calcul : partage des dépenses](docs/modele-de-calcul-partage.md).
- [Modèle de calcul : prix en heures de travail](docs/modele-de-calcul-heures.md).
- [Modèle de calcul : dépenses fréquentes](docs/modele-de-calcul-depenses.md).
- [Modèle de calcul : épargne dans le temps](docs/modele-de-calcul-epargne.md).
- [Modèle de calcul : taux marginal d'imposition](docs/modele-de-calcul-impot.md).
- [Règles de rédaction](docs/redaction.md) : ton, vocabulaire, catalogue de textes.
- [Chiffres annuels](docs/chiffres-annuels.md) : les tranches d'impôt, les normes de projection et les autres chiffres à revoir chaque année, avec chaque endroit où ils sont écrits.
- [Limites des champs](docs/limites-des-champs.md) : le minimum et le maximum de chaque saisie, et pourquoi.
- [Personas de test](docs/personas.md) : des personnes fictives et les chiffres à entrer pour éprouver chaque outil.

## État du projet

Fait :

- Les huit outils : assurance vie, frais de gestion, assurance hypothécaire, partage des dépenses, prix en heures de travail, dépenses fréquentes, épargne dans le temps, taux marginal d'imposition.
- Pour l'assurance, le MVP du cahier des charges, plus l'impôt selon le compte (CELI, REER, non enregistré), les dollars d'aujourd'hui, le rendement d'équilibre, le profil en étapes, le guide des colonnes du contrat, un lexique et une page « Détails et sources » (`/assurance/methode`). Chacun des autres outils a aussi la sienne (`/frais/methode`, `/hypotheque/methode`, `/partage/methode`, `/heures/methode`, `/depenses/methode`, `/epargne/methode`, `/impot/methode`), et `/sources`, lié dans le pied de page, les liste toutes.
- L'accueil, qui groupe les outils par thème (au quotidien, épargne et assurances) et la section « À propos ».
- La page de confidentialité, l'impression des résultats et des bornes réalistes sur chaque champ.
- Un écran de mot de passe (`shared/access/`), désactivé pour l'instant ; le site demande quand même aux moteurs de recherche de ne pas l'indexer (`NOINDEX`, dans `shared/seo/site.ts`) tant qu'il n'est pas public.
- La préparation du lancement : un fichier HTML et des métas par page, aperçus de lien, `robots.txt`, `sitemap.xml`, manifeste et icônes, vrai statut 404, en-têtes de sécurité (voir « Fichiers écrits après le build »).

Reste à décider ou à faire :

- **Lancement public** : l'image des liens partagés (`public/share.png`), les liens vers le modèle de calcul à faire pointer vers `master` plutôt que `develop`, puis passer `NOINDEX` à `false`.
- **Partage des résultats** : un lien qui garde le scénario après `#`, donc jamais envoyé au serveur.
- **Version anglaise.** Le catalogue `en.ts` existe, vide ; aucun sélecteur de langue n'est livré.
- **Scénario mixte** pour l'assurance (prévu au cahier des charges).
