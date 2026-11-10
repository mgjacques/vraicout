# Règles de rédaction

L'outil s'adresse à tout le monde, pas aux gens du métier. Toute personne qui écrit ou modifie un texte de l'interface suit ces règles.

## Portée

Les règles ne pèsent pas pareil partout.

- **Les outils** : formulaires, aides des champs, résultats, notes, pages « Détails et sources », phrases de formules. La personne y entre ses chiffres et y lit ce qu'ils donnent. Toutes les règles s'appliquent, « À éviter » compris : chaque phrase doit l'aider à comprendre un montant.
- **Les pages d'information** : confidentialité, « Vos données », ressources, sources. Elles décrivent des faits, et suivent les mêmes règles que les outils.
- **Les pages de présentation** : l'accueil, son en-tête, « À propos », la description du site. Elles présentent le projet et peuvent dire ce qu'il cherche à faire, avec un ton plus libre : une phrase plus longue, un mot comme « simple » ou « transparence », une intention plutôt qu'une description. La section « À éviter » y sert de repère, pas d'interdiction.

Partout, sans exception : le vouvoiement, pas de « nous », aucune recommandation de produit ni d'option, et rien de présenté comme garanti qui ne l'est pas (section « Rigueur »).

## Catalogue de textes

- Toutes les chaînes visibles sont dans `src/app/shared/i18n/fr/`, un fichier par outil (`assurance.ts`, `fees.ts`, `mortgage.ts`, `split.ts`, `hours.ts`, `spending.ts`, `savings.ts`, `marginal.ts`), plus `resources.ts` (la page Ressources), `transfer.ts` (la page Exporter ou importer vos données), `home.ts` (accueil, en-tête) et `common.ts` (ce qui sert à plusieurs outils). `fr.ts` les fusionne ; dans l'application, le fichier de chaque outil se charge avec sa page (`catalogs.ts`). Cela comprend les phrases de formules et les titres d'onglet. Aucun texte en dur dans les gabarits, unités comprises (`unit.years`, `unit.percent`).
- Un texte utilisé par deux outils va dans `common.ts`. Les clés de l'outil assurance n'ont pas de préfixe, sauf sa page de méthode (`insurance.method.`) ; ce qui sert aux deux pages de méthode commence par `method.` dans `common.ts`. Les clés de l'outil frais commencent par `fees.` (et `formula.fees.` pour les formules), celles de l'outil hypothécaire par `mortgage.` (et `formula.mortgage.`), celles de l'outil partage par `split.` (et `formula.split.`), celles de l'outil heures par `hours.` (et `formula.hours.`), celles de l'outil dépenses fréquentes par `spending.` (et `formula.spending.`), celles de l'outil épargne par `savings.` (et `formula.savings.`), celles de l'outil taux marginal par `marginal.` (et `formula.marginal.`).
- `en.ts` reprend exactement les mêmes clés ; un test l'exige. Ajouter une clé en français suffit : la version anglaise reste vide jusqu'à la traduction.
- Les clés sont typées : `i18n.t('cle.inconnue')` ne compile pas.
- Un champ obligatoire porte un astérisque rouge après son étiquette (`<app-required-mark />`), jamais « (obligatoire) » dans le texte. Un champ facultatif n'a aucune mention.
- Les paramètres s'écrivent `{nom}` dans la phrase et se passent en second argument : `i18n.t('chip.termEnd', { age: 55 })`.

## Ton

- **Vouvoyer, toujours.** On écrit « si vous décédez », jamais « si la personne décède ».
- **Pas de liste d’outils dans les textes généraux.** L’accueil, « À propos », la description du site et la page de confidentialité parlent de la démarche (vos chiffres, les calculs visibles, le vrai coût avant de décider) sans nommer les outils un par un. La liste des outils vient de `TOOLS` et se met à jour seule.
- **Pas de « nous ».** Une seule personne fait le site : « écrivez à », « l’adresse du site », jamais « écrivez-nous » ni « notre ».
- **Neutre.** L'outil ne recommande rien. Il compare et dit laquelle des options donne plus _selon les chiffres entrés_, jamais laquelle choisir. Pas d'argument sur la rémunération des vendeurs, pas de « meilleure option ».
- **Concret avant abstrait.** On dit d'abord ce que ça veut dire pour la personne, puis le terme technique : « La somme que vos proches recevraient. Elle figure sur votre contrat, souvent sous le nom de "capital assuré". »
- **Dire où trouver chaque chiffre** : relevé annuel, contrat, illustration, soumission.
- **Phrases courtes dans les outils.** Une idée par phrase. Les pages de présentation ont plus de latitude.
- **Gras avec retenue.** On écrit `**…**` dans la chaîne, et le gabarit l’affiche avec `<app-rich-text [text]="…" />` (jamais dans un attribut). Au plus un passage par texte, pour une mise en garde qui a une conséquence ou l’endroit où trouver un chiffre. Jamais pour décorer.
- **Italique.** `*…*`, avec le même composant, seulement pour un mot étranger ou le titre d’un document (_Aperçu du fonds_). Jamais pour l’emphase : les termes cités restent entre guillemets.
- **Espaces insécables.** Entre un nombre et son unité (`2\u00a0%`, `350\u00a0000\u00a0$`, `65\u00a0ans`), dans les milliers, avant « : ; ? ! » et à l’intérieur des guillemets « », l’espace est insécable (U+00A0, celle que produit `Intl.NumberFormat`) : une ligne ne se coupe jamais là. Un test refuse une espace ordinaire avant « % » ou « $ » et dans les milliers.
- **Formulations épicènes.** Préférer « la protection dure toute votre vie » à « vous êtes protégé », et « l'assureur doit accepter votre demande » à « être accepté ». Sans forcer : si la tournure épicène se répète ou alourdit la phrase, on en choisit une autre (« chacune » après « chaque personne ») ou on garde la forme courante. La lisibilité passe avant.

## À éviter

Dans un outil, le texte sonne comme une personne qui explique un calcul. Les tournures qui suivent l'alourdissent ou le rendent vendeur ; on les évite dans les outils et les pages d'information. Sur les pages de présentation, ce sont des repères : on peut s'en servir, avec mesure.

- **Le slogan en intertitre.** « Des comparaisons, pas des conseils », « Chaque calcul se vérifie ». Un intertitre dit de quoi parle le paragraphe : « Pas de recommandation », « Les formules ».
- **Le titre en phrase.** « Ce que montre chaque carte », « Comment le calcul avance ». Un titre est une étiquette courte, un nom : « Montants affichés », « Calcul ». Vaut pour l’interface comme pour la doc. Une question que la personne se pose (« Net ou brut ? ») reste permise dans l’interface.
- **Le moule « X, pas Y ».** « Une personne, pas une entreprise. » Utile une fois, lassant quand il revient.
- **L'énumération qui veut tout couvrir.** « Le lire, vérifier les calculs, signaler une erreur ou proposer une amélioration. » Garder l'élément qui compte : « Vous pouvez vérifier les calculs. »
- **La phrase de chute.** « La décision vous revient. », « Pas une version simplifiée. » Une phrase qui rassure ou conclut sans rien apprendre de plus s'enlève.
- **La promesse.** « En toute transparence », « simple et rapide », « en quelques clics », « pour vrai » répété. On montre, on ne qualifie pas.
- **Les paragraphes clonés.** Trois ou quatre blocs de même longueur, même structure, même rythme. Un sujet qui tient en une phrase reste une phrase ; un autre peut en prendre cinq.
- **Les mots d'entreprise.** Solution, expérience, optimiser, accompagner, en toute sérénité, au cœur de, n'hésitez pas.
- **Parler du site comme d'un produit.** On écrit ce que l'outil fait (« il additionne les frais année par année »), pas ce qu'il est (« un outil puissant »).

Pour vérifier un texte d'outil : le lire à voix haute. S'il sonne faux dit à quelqu'un autour d'un café, on le retravaille.

## Vocabulaire

| Dire                                                                                            | Éviter                                                 |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| montant versé au décès (et, la première fois, « capital assuré »)                               | capital, capital décès seul                            |
| valeur de rachat                                                                                | valeur, rachat seul                                    |
| ce que vous pourriez récupérer (avec, pour la valeur de rachat : « en mettant fin au contrat ») | en main, argent à votre nom, pour une valeur de rachat |
| différence placée                                                                               | écart, poche, épargne de l'écart                       |
| jusqu'à quel âge afficher les résultats, projection jusqu'à X ans                               | horizon                                                |
| rendement annuel espéré                                                                         | rendement nominal                                      |
| tout additionné, à titre indicatif                                                              | total étiqueté                                         |
| lignes du tableau du contrat                                                                    | jalons, ancres                                         |
| fin de la temporaire                                                                            | falaise                                                |
| participations (dividendes)                                                                     | bonus, rendement de la police                          |
| sans inscription, aucune inscription                                                            | sans compte (on pense au compte en banque)             |

Termes métier gardés, mais expliqués là où ils apparaissent et dans le lexique : valeur libérée, coût de base rajusté, période de contestation, option de conversion, avance sur police.

## Rigueur

- Ne pas présenter comme garanti ce qui ne l'est pas : participations, valeur de rachat totale, rendement.
- Dire les limites du modèle là où elles comptent : plafonds CELI et REER non vérifiés, impôt sur un rachat non calculé, approximations « à un an près ».
- Une source ne s'ajoute à `SOURCES` (`assurance/method/method.ts`, `frais/method/fees-method.ts`, `hypotheque/method/mortgage-method.ts`, `partage/method/split-method.ts`, `heures/method/hours-method.ts`, `depenses/method/spending-method.ts`, `epargne/method/savings-method.ts` et `impot/method/marginal-method.ts`, où chaque source suit le paragraphe qu'elle appuie ; l'accueil des organismes publics cités, dans `sources/sources-page.ts`) que si son adresse a été vérifiée. Pas de titre d'étude ni de chiffre qu'on ne peut pas retracer.
- Les règles fiscales changent : le texte renvoie à l'ARC et à Revenu Québec.
- Une fiche de la page Ressources (`ressources/resources.data.ts`) dit ce que la ressource contient, sans juger ce qu'elle vaut. Son adresse est vérifiée en ouvrant la page, à la source : l'éditeur, l'organisme ou la ressource elle-même, jamais une boutique ni un lien d'affiliation.

## Phrases de formules

Les phrases `formula.*` expliquent un calcul ; elles peuvent être plus techniques, mais restent lisibles.

- Chaque opérande vient de `params` : ne jamais écrire un nombre en dur.
- La phrase principale se termine par le résultat (`= {value}`), ou par le solde avant impôt quand une étape suit.
- Les étapes (`formula.tax.*`, `formula.real.*`) commencent par le contexte (« Placé dans un CELI : », « En dollars d'aujourd'hui : ») et finissent par le montant en main.
