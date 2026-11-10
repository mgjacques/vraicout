---
name: nouvel-outil
description: Marche à suivre pour ajouter un outil à VraiCoût (un nouveau calculateur ou comparateur sous src/app/<outil>/) — moteur, état, page, inscription dans TOOLS, textes, tests et documentation. À utiliser dès qu'on crée un outil, même à partir d'une simple idée (« un outil pour… », « ajouter un calculateur de… »), et pour vérifier qu'un outil ajouté n'a rien oublié.
---

# Ajouter un outil

Un outil touche une trentaine de fichiers (l'outil « heures » : 31). Les oublis typiques ne sont pas dans le code de l'outil, mais autour : l'inscription, les tests de l'accueil et du menu, la page de confidentialité, la doc. Suivre les étapes dans l'ordre.

L'outil le plus proche sert de modèle ; le lire avant d'écrire :

- **Une seule page**, formulaire et résultats côte à côte : `impot/` (le plus récent), `heures/` ou `partage/`.
- **Un parcours** (introduction, étapes, résultats, gardes de route) : `frais/` ou `hypotheque/`.

## 1. Cadrer avant de coder

Mettre au clair, et demander à la personne ce qui ne l'est pas :

- **La question** à laquelle l'outil répond, telle qu'elle apparaîtra en titre (« Ça représente combien d'heures de travail ? »).
- **Calculateur ou comparateur.** Un comparateur met les options à égalité (même budget, mêmes dépôts, mêmes années) et ne dit jamais laquelle choisir.
- **Le thème** dans `TOOLS` : `everyday` (au quotidien) ou `savings` (épargne et assurances).
- **Les noms**, qui ne sont pas les mêmes partout :

  | Quoi                                                                    | Langue                | Exemple (« heures »)               |
  | ----------------------------------------------------------------------- | --------------------- | ---------------------------------- |
  | Adresse et dossier `src/app/<outil>/`                                   | français, sans accent | `heures`                           |
  | Préfixe des clés de texte, fichier `fr/<préfixe>.ts`, noms dans le code | anglais               | `hours`, `HoursStore`, `WorkInput` |
  | Constante des routes                                                    | français, majuscules  | `HEURES_ROUTES`                    |

- **Le modèle de calcul.** Écrire d'abord `docs/modele-de-calcul-<outil>.md` (sur le modèle de `modele-de-calcul-heures.md` : une section par calcul, puis « Limites » et « Bornes des saisies ») et le faire valider. C'est la référence des tests et des phrases de formules.

## 2. Moteur : `src/app/<outil>/engine/`

Pur : aucun import d'Angular. Tout calcul vit ici, jamais dans un composant.

- `types.ts` : l'`Input` (les chiffres complets) et le `Result`. **Tout montant affiché est un `Money`** (`shared/engine/money.ts`), qui porte sa formule.
- `limits.ts` : `<PRÉFIXE>_LIMITS = { … } satisfies Record<string, Limit>`, chaque borne commentée par sa raison. Les taux s'écrivent en pourcentage. Pour un salaire, réutiliser `payMax()` de `shared/engine/pay.ts`.
- `blank.ts` : le `Form` (chaque champ numérique `number | null` : `null` veut dire que la personne a vidé le champ), `default…Form()` avec des chiffres ronds et réalistes pour que le premier écran dise déjà quelque chose, `missing…Fields()` et `to…Input()`.
- `<calcul>.ts` : chaque montant passe par `money(valeur, 'formula.<préfixe>.<nom>', { opérandes })` de `shared/engine/formulas.ts`. Les opérandes sont celles du calcul, jamais recopiées à la main.
- **Formatage des opérandes** : `formatParams` décide du format d'après le nom du paramètre (`MONEY_KEYS`, `PERCENT_KEYS`, `HOUR_KEYS` dans `formulas.ts`). Un nom absent de ces listes s'affiche comme un simple nombre : ajouter tout nouveau nom de montant ou de pourcentage, ou réutiliser un nom existant (`amount`, `price`, `ratePercent`…).
- Réutiliser `shared/engine/` avant d'écrire : `tax.ts` (impôt selon le compte), `inflation.ts` (dollars d'aujourd'hui), `pay.ts` (fréquences de paie). Ce qui servirait à deux outils va dans `shared/`. **Un outil n'importe jamais un autre outil.**
- `<calcul>.spec.ts` : un premier test sur les chiffres de départ, avec le calcul fait à la main en commentaire. Puis les cas limites (zéro, division impossible, champs facultatifs) et un test « explains every amount with the catalog operands » : `explainMoney(montant, lookup)` ne doit laisser aucun `{param}` (voir `heures/engine/hours.spec.ts`).

## 3. État : `src/app/<outil>/state/`

Copier `heures/state/hours.store.ts` : `draft` (le formulaire tel que tapé) et `committed` (le dernier `Input` complet), `projection` calculée sur `committed`, sauvegarde par `loadSaved` et `save` de `shared/storage/device-storage` sous `SAVE_KEY = '<outil>'`, et `reset()`. Un champ vidé ne remplace jamais le dernier calcul complet.

`<préfixe>.store.spec.ts` : champ vidé, reprise à la visite suivante, remise à zéro. Pour un parcours, aussi l'étape reprise et les gardes (voir `frais/state/fees.store.spec.ts`).

## 4. Page et routes

- `<outil>.routes.ts` : `export const <OUTIL>_ROUTES: Routes`, avec `title: 'title.<préfixe>' satisfies MessageKey`.
- `src/app/app.routes.ts` : une entrée `loadChildren` avant `confidentialite`.
- `src/app/shared/seo/pages.ts` : chaque adresse de l'outil dans `SITE_PAGES`, avec le même titre que sa route. L'accueil de l'outil et sa page `/methode` ont une `description` (elles vont dans le sitemap) et l'accueil un `shareTitle` (`tool.<préfixe>.title`) ; les pages qui dépendent des chiffres entrés (profil, comparaison) n'en ont pas. Un test refuse une route absente de la liste.
- Les composants partagés, sans réinventer :
  - les champs `app-money-input` (dollars) et `app-number-input` (%, ans, heures), avec les bornes lues dans `limits.ts` ; les setters arrondissent et bornent avec `cents`, `whole` et `fromPercent` (`shared/engine/limits.ts`), sans en écrire de copie locale ;
  - `app-figure` et `app-formula-popover` pour chaque montant, cliquable vers sa formule ;
  - `app-rich-text` pour tout texte qui contient `**` ou `*` ;
  - `app-warning` (`variant` `insurance` ou `investing`) si l'outil touche l'assurance ou les placements ;
  - `app-reset-button` et `app-page-notes`.
- Composant autonome, `ChangeDetectionStrategy.OnPush`, signaux. Tout composant d'interface vient de PrimeNG.
- Styles dans `src/styles.css` seulement. Une couleur de série de graphique se valide avec le skill dataviz et ne colore jamais du texte. Aucun défilement horizontal de 320 à 1920 px.

## 5. Inscription

- `src/app/shared/tools.ts` : une entrée dans `TOOLS` (`path`, `theme`, une icône `pi-…` de PrimeIcons, `short`, `title`, `body`). L'ordre du tableau est l'ordre d'affichage. Si l'outil a sa page `/<outil>/methode`, ajouter `methodUpdated` (la clé de sa date) : la page `/sources` la liste alors.
- `src/app/shared/i18n/fr/home.ts` : `tool.<préfixe>.short` (le lien du menu), `.title` (la question) et `.body` (une phrase).
- `src/app/app.spec.ts` : la liste des liens attendus sur l'accueil, et un test qui ouvre l'outil et vérifie le titre et un chiffre des valeurs de départ.
- `src/app/shell/mobile-menu/mobile-menu.spec.ts` : le libellé dans les listes attendues.
- **Confidentialité** : rien à changer si l'outil garde ses chiffres comme les autres (`shared/storage/`). Une nouvelle sorte de donnée gardée s'ajoute à `shared/i18n/fr/privacy.ts`.
- **Textes généraux** : l'accueil, « À propos », la description de `index.html` et la confidentialité ne nomment pas les outils (voir `docs/redaction.md`). Ne pas y ajouter le nouvel outil.

## 6. Textes

- `src/app/shared/i18n/fr/<préfixe>.ts` : `export const <préfixe> = { … }`, ajouté à la fusion dans `fr.ts`. Clés `<préfixe>.*` pour l'interface, `formula.<préfixe>.*` pour les formules, `title.<préfixe>` pour l'onglet. `en.ts` suit tout seul.
- Suivre `docs/redaction.md` à la lettre : vouvoiement, ton neutre, concret avant abstrait, dire où trouver chaque chiffre (« au bas de votre talon de paie »), gras au plus une fois par texte.
- Chaque champ dit s'il est obligatoire ou facultatif, et l'avis de champ manquant suit le modèle de `hours.form.incomplete`.
- Une phrase de formule se termine par le résultat (`= {value}`), et chaque nombre vient d'un paramètre.
- Une source ne s'ajoute que si son adresse a été vérifiée.

## 7. Documentation

- `docs/modele-de-calcul-<outil>.md` : à jour avec le code final.
- `docs/chiffres-annuels.md` : chaque chiffre de l'outil qui change d'une année à l'autre, s'il y en a.
- `docs/limites-des-champs.md` : une section « Bornes par outil » pour `<outil>/engine/limits.ts`.
- `docs/architecture.md` : l'arbre de `src/app/`, une section « Outil … (`<outil>/`) » et les lignes de ses tests dans le tableau « Tests ».
- `docs/redaction.md` : le fichier de textes dans la liste, et le préfixe des clés.
- `README.md` : une ligne dans la liste des outils, et le lien vers le modèle de calcul dans « Documentation ».
- `CLAUDE.md` : le nom du dossier dans la liste des outils.

## 8. Vérifier

1. `npx ng test --watch=false` passe.
2. `npm run build` passe.
3. Dans le navigateur (`npm start`) : l'outil s'ouvre depuis l'accueil et depuis le menu, chaque montant montre sa formule, vider un champ obligatoire garde les derniers résultats, le site s'affiche en 320 px et en grand écran, en clair et en sombre, et « Repartir de zéro » ramène aux chiffres de départ.
4. `npx prettier --write` sur les fichiers touchés.
5. Commit en français, sur le modèle de l'historique : `Outil « Prix en heures de travail » (/heures)`.
