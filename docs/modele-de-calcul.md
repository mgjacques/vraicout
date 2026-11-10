# Modèle de calcul

Le moteur de l'outil assurance est dans `src/app/assurance/engine/`. L'impôt selon le compte (`afterTax`, `CAPITAL_GAIN_INCLUSION`) et les dollars d'aujourd'hui (`presentValueFactor`) sont dans `src/app/shared/engine/`, partagés avec l'outil frais (voir [Modèle de calcul : frais de gestion](modele-de-calcul-frais.md)). Il est pur : aucune dépendance à Angular ni au DOM, et il ne lit que le `ScenarioInput` qu'on lui passe (plus l'année en cours). Point d'entrée : `project(input)` dans `project.ts`.

## Principe de transparence

Chaque montant est un `Money` :

```ts
{ value, formulaId, params, steps? }
```

- `formulaId` est une clé du catalogue (par exemple `formula.gap.term`), dont la phrase contient des repères `{param}`.
- `params` contient les **mêmes** opérandes que le calcul, et `params.value` vaut toujours le résultat de la formule principale.
- `steps` ajoute des étapes à l'explication, dans l'ordre : l'impôt (`formula.tax.*`), puis la conversion en dollars d'aujourd'hui (`formula.real.*`).
- `explainMoney()` dans `formulas.ts` assemble la phrase principale et les étapes. Les montants sont formatés en dollars au cent près, les pourcentages avec « % ».

Un test parcourt tous les montants de l'exemple et vérifie que chacun a une phrase dans le catalogue, et que `params.value` égale la valeur.

## Pas de temps

- Le calcul avance **mois par mois**, du mois 0 (aujourd'hui) jusqu'à l'horizon.
- Le rendement entré est un **taux effectif annuel** : 6 % font exactement 6 % sur douze mois. Rendement mensuel = `(1 + rendement annuel)^(1/12) − 1` (`toMonthlyRate`, dans `shared/engine/rates.ts`, la même conversion que les outils frais et épargne).
- Le rendement d'équilibre (`breakEvenReturn`) refait la projection à différents rendements entrés : il est donc lui aussi un taux effectif annuel.
- Chaque mois applique **d'abord l'intérêt, puis le versement**.
- Une prime annuelle est traitée comme douze versements mensuels égaux.
- Les primes du mois _m_ comptent pour _m_ = 1, 2, …

## Horizon et âges repères

- L'horizon par défaut est le plus tard de ces trois âges : âge actuel + 40 (sans dépasser 110 ans, le maximum du champ), 65 ans (si la personne ne les a pas encore), et la fin de la temporaire. Un horizon choisi plus tôt que la fin de la temporaire est repoussé jusqu'à elle.
- Les âges repères sont l'année avant la fin de la temporaire (sa dernière année en vigueur), la fin de la temporaire, 65 ans (omis si la personne a déjà 65 ans ou plus) et la fin de l'horizon. Deux repères au même âge partagent un bouton. Les repères sont des raccourcis du champ « À quel âge ? », qui accepte tout âge entier entre l'âge actuel et la fin de l'horizon (`ScenarioStore.focus`). Sans choix, c'est la fin de la temporaire. L'âge choisi vaut pour la visite seulement : il n'est pas gardé dans le navigateur.
- La matrice a une ligne par année, plus une ligne à l'horizon s'il ne tombe pas sur une année pleine.

## Règle du budget égal

C'est la règle centrale. Chaque mois :

- l'option **permanente** paie sa prime tant qu'il reste des années de primes ;
- l'option **temporaire** paie sa prime tant que la temporaire est en vigueur ;
- **l'écart entre les deux va à l'option qui paie le moins**, multiplié par la « part de la différence que vous placeriez vraiment » ; le reste est considéré comme dépensé.

Ainsi, pour une part de 100 % et un rendement nul, les deux options sortent exactement la même somme chaque mois. Un test le vérifie mois par mois.

Conséquences :

- Une police déjà libérée (0 année de primes) ne crée pas d'argent fictif : c'est l'option permanente qui place la prime de la temporaire.
- Une permanente pas encore achetée (une illustration qu'on vous propose, `permanent.inForce` faux) n'a rien de particulier : valeur de rachat de 0 aujourd'hui, toutes les années de primes à venir, et les lignes du tableau de l'illustration. Le formulaire masque alors le champ de la valeur de rachat d'aujourd'hui et l'envoie à 0.
- Un contrat **déjà en vigueur** (`permanent.inForce` vrai) : l'option temporaire suppose qu'on y met fin aujourd'hui. Sa valeur de rachat (`assumptions.surrender`) est versée dans la poche de la temporaire au mois 0, comme un versement unique, avec le même compte et le même rendement que la différence placée. Les deux options partent donc du même montant : la valeur de rachat d'un côté, la même somme placée de l'autre (testé). Dans un REER, ce versement est majoré du remboursement d'impôt comme les autres.
- Après la fin des primes de la permanente, si la temporaire court encore, l'option permanente place la prime de la temporaire. C'est la poche « différence placée, côté permanente ».
- Une fois les deux primes terminées, plus rien n'est versé ; les soldes continuent de fructifier.

`assumptions.phases` découpe la projection en périodes à primes constantes. Le panneau des paramètres les décrit en clair.

## Option permanente

| Montant                          | Règle                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Primes payées                    | Prime mensuelle × mois de primes écoulés, plafonnés au nombre d'années restantes. Les primes déjà payées avant aujourd'hui ne comptent pas. |
| Montant versé au décès (garanti) | Le montant du contrat, constant.                                                                                                            |
| Avec participations              | Seulement si un taux de hausse est saisi (0 à 10 %) : montant × (1 + taux)^années. Aucune hausse n'est jamais inventée.                     |
| Valeur de rachat projetée        | Interpolée entre la valeur d'aujourd'hui et les valeurs futures saisies (voir plus bas).                                                    |
| Valeur de rachat garantie        | Interpolée entre les valeurs garanties saisies seulement.                                                                                   |
| Différence placée                | Poche alimentée par la règle du budget égal, après impôt.                                                                                   |

### Interpolation des valeurs de rachat (`interpolate.ts`)

- **Points de départ.**
  - Valeur projetée : la valeur d'aujourd'hui au mois 0, puis chaque ligne saisie. Une ligne qui n'a que la valeur garantie sert aussi de valeur projetée.
  - Au mois 0, une valeur d'aujourd'hui saisie l'emporte sur une ligne au même âge. Sans valeur d'aujourd'hui, la ligne sert de point de départ.
  - Valeur garantie : seulement les lignes saisies.
- **Entre deux points :**
  - en ligne droite si l'un des deux vaut 0 ;
  - sinon, croissance à taux constant (interpolation exponentielle).
- **Avant le premier point :** pas de valeur ; la courbe garantie n'apparaît qu'à partir de la première valeur garantie.
- **Après le dernier point :** la valeur reste constante. Rien n'est extrapolé au-delà du tableau du contrat.
- **Ligne passée :** une ligne à un âge déjà passé est ignorée.

La valeur de rachat n'est pas imposée dans l'outil. En réalité, un rachat est imposable au-delà du coût de base rajusté du contrat, que l'outil n'a pas ; les textes le signalent.

## Option temporaire

| Montant                | Règle                                                                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primes payées          | Prime mensuelle × mois écoulés, plafonnés à la durée de la temporaire.                                                                                                                                                                  |
| Montant versé au décès | Le montant de la temporaire **strictement avant** sa fin, puis 0. À l'âge de fin, il vaut déjà 0.                                                                                                                                       |
| Argent placé           | Poche alimentée par la règle du budget égal, après impôt. Pour un contrat déjà en vigueur, elle commence avec sa valeur de rachat d'aujourd'hui (`formula.gap.term.surrender`, ou `surrenderOnly` tant que rien d'autre n'y est versé). |

## Épargne supplémentaire

Un montant mensuel facultatif, versé **de la même façon dans les deux options**, toujours affiché à part. Il a le même traitement fiscal que la différence placée.

## Impôt selon le compte

Le même compte s'applique à tout l'argent placé, des deux côtés. Le montant « en main » est ce que la personne aurait **en retirant tout à cet âge**.

| Compte         | Règle                                                                                                                                                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CELI           | Aucun impôt.                                                                                                                                                                                                                                                                       |
| REER           | Chaque versement est majoré du remboursement d'impôt au taux d'aujourd'hui, supposé replacé dans le REER (versement ÷ (1 − taux)). Au retrait, tout le solde est imposé au taux prévu à ce moment-là. Avec le même taux avant et après, le résultat est identique au CELI (testé). |
| Non enregistré | Le gain (solde − sommes versées) est traité comme un gain en capital : 50 % est imposé au taux marginal (`CAPITAL_GAIN_INCLUSION`).                                                                                                                                                |

Limites assumées :

- Un rachat est imposable au-delà du coût de base rajusté, que l'outil n'a pas : la valeur de rachat reste avant impôt, des deux côtés (celle que garde la permanente comme celle que la temporaire encaisse aujourd'hui).
- Les plafonds de cotisation CELI et REER ne sont pas vérifiés.
- Des placements qui rapportent surtout des intérêts sont imposés plus lourdement que le modèle ne le suppose.
- Au décès, un REER est imposé d'un coup, sauf transfert au conjoint ; l'outil applique le taux de retrait.

## Dollars d'aujourd'hui

Option désactivée par défaut, inflation de 2 % par défaut (entre 0 et 10 %). Quand elle est active :

- un montant à un instant donné (montant au décès, solde, valeur de rachat) est divisé par (1 + inflation)^(mois ÷ 12) ;
- les primes payées sont ramenées **chacune depuis le mois où elle est payée**, par une somme géométrique (`presentValueFactor`).

La conversion est une étape de l'explication : la phrase principale montre le montant de l'époque, puis sa valeur d'aujourd'hui.

## Rendement d'équilibre

`breakEvenReturn(input, mois)` cherche le rendement annuel auquel les deux options laissent **le même montant en main** à cet âge. Ce montant comprend, côté permanente, la valeur de rachat et la différence placée ; côté temporaire, la différence placée.

- Toutes les autres saisies restent celles de la personne.
- La comparaison porte sur `inHand` des deux côtés.
- **Recherche :** balayage de 0 à 15 % par pas de 0,5 %, puis 20 itérations de dichotomie sur le premier changement de signe. Le calcul s'arrête à l'âge demandé, pour aller plus vite.
- **Sans point d'équilibre entre 0 et 15 %,** le résultat dit quelle option l'emporte sur tout l'intervalle.
- **Au mois 0,** il n'y a rien à comparer ; le résultat est `null`.

Le moteur accepte un rendement jusqu'à 15 % pour cette recherche ; l'interface limite la saisie à 10 %.

## Les deux totaux : en main et pour vos proches

Le moteur calcule deux totaux par option, chacun un `Money` avec sa phrase. Le résumé « En bref », les graphiques et la ligne de chaque année du tableau lisent ces mêmes montants ; aucun composant ne refait l'addition.

- **En main si vous êtes en vie** (`inHand`, `formula.inHand.*`) :
  - permanente : valeur de rachat projetée + différence placée côté permanente ;
  - temporaire : différence placée.
- **Pour vos proches si vous décédez** (`forHeirs`, `formula.forHeirs.*`) :
  - permanente : montant garanti + différence placée côté permanente ;
  - temporaire : montant de la temporaire (0 à partir de sa fin) + différence placée.
  - L'argent placé est compté parce qu'il reviendrait aussi aux proches. Les participations non garanties ne sont pas comptées.
- **Variantes de la permanente :** `inHandGuaranteed` remplace la valeur de rachat projetée par la valeur garantie ; `forHeirsProjected` remplace le montant garanti par le montant avec participations (seulement si un taux de hausse est saisi).
- **L'épargne supplémentaire,** identique des deux côtés, est exclue des totaux.

« En bref » (`milestones/milestone-cards.ts`) est un tableau à deux colonnes, une par option, lu à l'âge choisi. Ses lignes vont du plus sûr au moins sûr : primes payées d'ici là, versé aux proches si vous décédez, puis ce que vous pourriez récupérer si vous êtes en vie. Sous chaque total, ses deux parts quand de l'argent placé en fait partie, et l'écart entre les options.

- Sous 0,5 % d'écart, la ligne dit « à peu près le même montant » plutôt que de désigner une option.
- La ligne « en vie » ne met pas les deux côtés sur le même pied : la valeur de rachat est dite totale, non garantie et obtenue en mettant fin au contrat ; sa partie garantie est donnée, ou dite inconnue quand le tableau n'en a pas encore à cet âge. Quand la permanente est devant sur cette ligne, l'écart rappelle qu'il faut mettre fin au contrat et la protection qu'on perdrait.
- La comparaison reste sur la valeur de rachat totale (`inHand`), pas sur la partie garantie, souvent inconnue avant la première ligne du tableau.
- Quand la valeur de rachat à cet âge est sur la ligne droite tracée depuis 0 $ jusqu'à la première ligne du tableau (`formula.cash.projected.linear`, point de gauche à 0), une note le dit sous le chiffre : un vrai contrat vaut souvent moins ses premières années.
- Le rendement d'équilibre suit le tableau, en une phrase. Il n'est pas affiché sur cette ligne droite, pour la même raison que sans tableau.
- L'épargne supplémentaire, quand il y en a, apparaît une seule fois, sous le tableau, à part des deux options.
- Les mises en garde sont réunies sous « À savoir ». Sans aucune valeur de rachat future entrée (`assumptions.cashScale` faux), la valeur de rachat reste celle d'aujourd'hui : « À savoir » le signale en premier, et le rendement d'équilibre n'est pas affiché, puisqu'il ne comparerait qu'à cette valeur figée.

## Graphiques

- « Si vous décédez » : `forHeirs` de chaque option, et `forHeirsProjected` pour la permanente. Ce graphique a un point de plus, le dernier mois où la temporaire paie (`beforeTermEnd`) : sa courbe tombe à la verticale jusqu'à l'argent placé, au lieu de descendre en pente sur un an. L'axe des âges est numérique pour placer ce point.
- « Si vous êtes en vie » : `inHand` de chaque option, `inHandGuaranteed` pour la permanente et, si elle est saisie, l'épargne supplémentaire, en gris neutre : c'est un repère, pas une troisième option.
- Un trait vertical plein marque l'âge choisi dans « En bref », sur les deux graphiques.
- **Trait plein :** le total que compte « En bref ». **Pointillé :** une variante de la même option. La légende montre le pointillé.
- L'infobulle donne, sous chaque total qui contient de l'argent placé, les deux parts (assurance ou valeur de rachat, et argent placé).

## Repères et valeurs de départ

- Curseur de rendement : repères à 2,4 % (court terme), 3,2 % (obligations) et 6,5 % (actions), d'après les normes d'hypothèses de projection 2026 de l'IQPF et de FP Canada, avant frais (`RETURN_MARKERS`, `engine/limits.ts`). Le rendement de départ est celui des obligations (`DEFAULT_RETURN`).
- Taux d'imposition de départ : 36 %, le taux combiné fédéral et Québec de 2026 entre 58 523 $ et 108 680 $ de revenu imposable (`DEFAULT_TAX_RATE`).
- Inflation de départ : 2 %, la cible de la Banque du Canada.

La page `/assurance/methode` explique ce modèle au public, en langage courant, avec la source de chaque repère et de chaque règle d'impôt. Un changement ici la met à jour aussi, avec sa date de dernière mise à jour (`insurance.method.updated`).

La page montre aussi le calcul en notation mathématique (MathML), dans `src/app/assurance/method/insurance-*-formula.html`, avec le sens de chaque symbole. Ces formules sont écrites à la main : **tout changement du calcul dans le moteur met à jour la formule MathML et ses symboles dans le même changement**, pour qu'il n'y ait jamais d'écart entre ce qui est affiché et ce qui est exécuté.

## Bornes des saisies

Le minimum et le maximum de chaque saisie sont dans [Limites des champs](limites-des-champs.md).

Une valeur non numérique est remplacée par une valeur par défaut ; un montant négatif, par 0.
