# Limites des champs

Chaque champ numérique a un minimum et un maximum. Le but est d'empêcher des projections absurdes (10 milliards placés à 15 % pendant 60 ans), pas de juger un cas réel. Les plafonds sont donc larges exprès : un revenu, un prêt ou une police hors du commun doit encore passer.

## Application

- **Le maximum s'applique pendant la saisie.** Taper 200 dans un champ plafonné à 60 donne 60 tout de suite.
- **Le minimum s'applique à la sortie du champ.** On peut ainsi taper « 4 » en route vers « 42 » sans être ramené au minimum en cours de frappe.
- **Le champ dit quand il ramène un nombre.** Une note sous le champ donne la borne (« Maximum : 60 ans. Le calcul utilise ce nombre. ») et s'efface à la frappe suivante qui reste dans les bornes. Les lecteurs d'écran l'annoncent.
- **Un champ vidé reste vide.** Il ne devient pas 0 ; le formulaire le signale comme manquant, comme avant.
- **Les chiffres déjà sauvegardés ne sont pas corrigés.** Une valeur gardée sur l'appareil au-dessus d'un nouveau plafond reste telle quelle jusqu'à ce qu'on touche au champ.

Le champ (`NumberField`, dans `src/app/shared/number-input/`) applique les bornes ; le setter du formulaire les applique aussi, pour qu'aucune autre voie ne les contourne. Les setters arrondissent et bornent avec les mêmes fonctions dans chaque outil : `cents`, `whole` et `fromPercent`, dans `src/app/shared/engine/limits.ts`.

## Fichiers

- **Un seul endroit par outil** : `src/app/<outil>/engine/limits.ts`. Le gabarit et le setter lisent tous deux cet objet ; il n'y a pas de nombre en dur ailleurs. Les taux y sont écrits en pourcentage, comme on les tape.
- **Le salaire** dépend de la fréquence de paie : `ANNUAL_PAY_MAX` et `payMax()` dans `src/app/shared/engine/pay.ts`, partagés par le partage des dépenses et le prix en heures.
- Ce document est à mettre à jour avec le fichier.

## Bornes par outil

### Assurance vie (`assurance/engine/limits.ts`)

| Champ                                           | Bornes                                      | Raison                                                                                             |
| ----------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Âge                                             | 0 à 100 ans                                 | Une police peut être prise pour un enfant ; au-delà de 100 ans, la projection ne montre plus rien. |
| Année de naissance                              | année courante − 100 à année courante       | Les mêmes bornes que l'âge.                                                                        |
| Jusqu'à quel âge afficher les résultats         | 0 à 110 ans                                 | Les contrats arrivent à terme à 100 ans, certains à 121 ; 110 montre la fin de presque tous.       |
| Prime (au mois ou à l'année)                    | 0 à 250 000 $                               | Une prime annuelle sur une grosse police peut dépasser 100 000 $.                                  |
| Montant versé au décès                          | 0 à 10 000 000 $                            | Une protection élevée, encore personnelle.                                                         |
| Valeur de rachat, valeurs du tableau du contrat | 0 à 20 000 000 $                            | Projetées sur des décennies, ces valeurs peuvent devenir élevées.                                  |
| Années de primes à payer                        | 0 à 80                                      |                                                                                                    |
| Hausse annuelle avec participations             | 0 à 10 %                                    |                                                                                                    |
| Épargne supplémentaire                          | 0 à 20 000 $ par mois                       |                                                                                                    |
| Taux d'imposition, aujourd'hui et au retrait    | 0 à 60 % (36 % par défaut)                  | Au-dessus du taux marginal le plus élevé au Québec, avec de la marge.                              |
| Inflation                                       | 0 à 10 % (2 % par défaut)                   |                                                                                                    |
| Rendement (curseur)                             | 0 à 10 %, par pas de 0,1 (3,2 % par défaut) | Le moteur accepte jusqu'à 15 % (`returnPercent`). Repères 2,4, 3,2 et 6,5 % (`RETURN_MARKERS`).    |
| Part de la différence placée (curseur)          | 0 à 100 %, par pas de 5 (`reinvestPercent`) |                                                                                                    |
| Durée de la temporaire (choix)                  | 10, 20, 25 ou 30 ans (20 par défaut)        |                                                                                                    |

### Frais de gestion (`frais/engine/limits.ts`)

| Champ                                        | Bornes           | Raison                                                                                                |
| -------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| Montant placé au départ                      | 0 à 10 000 000 $ |                                                                                                       |
| Montant ajouté chaque mois                   | 0 à 50 000 $     |                                                                                                       |
| Années avant la retraite                     | 1 à 60 ans       |                                                                                                       |
| Rendement annuel espéré                      | 0 à 12 %         | Au-delà, des décennies de rendement composé donnent des montants sans rapport avec un placement réel. |
| RFG                                          | 0 à 5 %          |                                                                                                       |
| Frais de conseiller                          | 0 à 3 %          |                                                                                                       |
| Taux d'imposition, aujourd'hui et au retrait | 0 à 60 %         | Voir l'assurance.                                                                                     |
| Années de retraits                           | 1 à 50 ans       |                                                                                                       |
| Inflation                                    | 0 à 10 %         |                                                                                                       |

### Assurance hypothécaire (`hypotheque/engine/limits.ts`)

| Champ                                            | Bornes           | Raison                                                              |
| ------------------------------------------------ | ---------------- | ------------------------------------------------------------------- |
| Montant du prêt                                  | 0 à 5 000 000 $  |                                                                     |
| Années à rembourser, durée de la temporaire      | 1 à 40 ans       | La plupart des prêts durent 25 ou 30 ans ; 40 laisse de la marge.   |
| Taux d'intérêt                                   | 0 à 15 %         | On n'a pas vu de taux aussi élevés depuis le début des années 1980. |
| Prime mensuelle de la banque ou de la temporaire | 0 à 5 000 $      |                                                                     |
| Montant de la temporaire                         | 0 à 10 000 000 $ |                                                                     |

### Partage des dépenses (`partage/engine/limits.ts`)

| Champ   | Bornes                                                                                      | Raison                                                |
| ------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Salaire | 0 à 1 000 000 $ par année, ramené à la paie (38 462 $ aux deux semaines, 83 333 $ par mois) | Un revenu élevé, encore personnel.                    |
| Facture | 0 à 100 000 $                                                                               | Une grosse dépense commune, comme une année de loyer. |

### Prix en heures de travail (`heures/engine/limits.ts`)

| Champ                            | Bornes                      | Raison                      |
| -------------------------------- | --------------------------- | --------------------------- |
| Paie nette                       | comme le salaire du partage |                             |
| Heures par semaine               | 1 à 80 h                    | Deux emplois à temps plein. |
| Ce que le travail coûte par mois | 0 à 10 000 $                |                             |
| Prix                             | 0 à 5 000 000 $             | Une maison.                 |

### Dépenses fréquentes (`depenses/engine/limits.ts`)

| Champ                    | Bornes                    | Raison                                                                                                |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Montant payé chaque fois | 0 à 100 000 $             | Une année de loyer payée d'un coup : bien au-delà d'une dépense courante.                             |
| Valeur de X              | 1 à 365, nombre entier    | « Aux 365 jours » : une fois par année.                                                               |
| Nombre d'années          | 1 à 50 ans                | Une vie de travail.                                                                                   |
| Rendement annuel espéré  | 0 à 12 % (7 % par défaut) | Au-delà, des décennies de rendement composé donnent des montants sans rapport avec un placement réel. |
| Inflation                | 0 à 10 % (2 % par défaut) |                                                                                                       |

### Taux marginal d'imposition (`impot/engine/limits.ts`)

| Champ            | Bornes          | Raison                                                                                         |
| ---------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| Revenu imposable | 0 à 1 000 000 $ | Le plafond annuel du salaire (`ANNUAL_PAY_MAX`). Au-delà, le taux le plus haut ne change plus. |
| Revenu de plus   | 0 à 500 000 $   | Une grosse prime ou une année de contrat en plus d'un salaire.                                 |

### Épargne dans le temps (`epargne/engine/limits.ts`)

| Champ                      | Bornes           | Raison                                                                               |
| -------------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| Montant de départ          | 0 à 10 000 000 $ | Comme les frais de gestion.                                                          |
| Dépôt mensuel              | 0 à 50 000 $     | Comme les frais de gestion.                                                          |
| Années de dépôts           | 1 à 60 ans       | Toute une vie de travail, du premier emploi à la retraite.                           |
| Années sans dépôt, ensuite | 0 à 60 ans       | D'un arrêt à 40 ans jusqu'à 100 ans ; au-delà, des sommes sans lien avec la réalité. |
| Rendement annuel espéré    | 0 à 12 %         | Au-delà, des décennies de capitalisation donnent des sommes irréalistes.             |
| Années d'attente           | 0 à 59 ans       | Et plus court que les années de dépôts, sinon le départ retardé ne dépose rien.      |
| Inflation                  | 0 à 10 %         | Comme les autres outils.                                                             |
