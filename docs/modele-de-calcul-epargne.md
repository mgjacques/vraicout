# Modèle de calcul : épargne dans le temps

Le code est dans `src/app/epargne/engine/growth.ts`. L'outil projette un seul placement, puis le même placement commencé plus tard. Il ne calcule ni impôt ni frais : il montre l'effet du temps sur un rendement fixe.

## Saisies

- Montant de départ (facultatif, 0 si vide), placé au mois 0.
- Dépôt mensuel.
- Années de dépôts.
- Années de croissance sans dépôt, après la dernière année de dépôts (facultatif, 0 si vide).
- Rendement annuel espéré.
- Années d'attente pour la comparaison (facultatif, 0 si vide : pas de comparaison). Elles doivent être moins nombreuses que les années de dépôts.
- Dollars d'aujourd'hui : une case et un taux d'inflation, 2 % par défaut.

Il faut un montant de départ ou un dépôt mensuel. Le nombre total d'années est `années de dépôts + années de croissance`.

## Rendement mensuel

Le rendement entré est un **taux effectif annuel** : 7 % font exactement 7 % sur douze mois. Il est converti en taux mensuel équivalent.

`taux mensuel = (1 + rendement)^(1/12) − 1`

C'est la façon habituelle d'annoncer un rendement, et la même conversion que les outils assurance et frais (`toMonthlyRate`, dans `shared/engine/rates.ts`).

## Le placement, mois par mois

Chaque mois, de 1 jusqu'à la fin : d'abord l'intérêt, puis le dépôt, tant qu'on est dans les années de dépôts.

`solde(m) = solde(m − 1) × (1 + taux mensuel) + dépôt (si m ≤ années de dépôts × 12)`

avec `solde(0) = montant de départ`. La boucle donne le même résultat que les formules fermées, qui servent aux phrases :

- à la fin des dépôts (n mois) : `départ × (1 + i)^n + dépôt × ((1 + i)^n − 1) ÷ i` ;
- à la fin : `solde à la fin des dépôts × (1 + rendement)^(années de croissance)`.

## Montants affichés

| Montant                   | Règle                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Total versé               | `départ + dépôt × 12 × années de dépôts`                                                                      |
| Solde à la fin des dépôts | Formule fermée ci-dessus. Affiché seulement s'il y a des années de croissance.                                |
| Solde final               | Formule fermée ci-dessus.                                                                                     |
| Intérêts gagnés           | `solde final − total versé`                                                                                   |
| Part des intérêts         | `intérêts gagnés ÷ solde final`, en pourcentage arrondi à une décimale, dans la formule comme sur le montant. |

Le graphique montre, à la fin de chaque année, le total versé jusque-là et les intérêts accumulés, empilés, et le solde du départ retardé s'il y en a un.

## Commencer plus tard

Le même placement, commencé `retard` années plus tard, avec la même date de fin de dépôts et la même date de fin :

- le montant de départ est placé au mois `retard × 12` ;
- les dépôts vont du mois `retard × 12 + 1` à la fin des années de dépôts, soit `années de dépôts − retard` années ;
- les années de croissance sont les mêmes.

Les deux options ont donc le même dépôt mensuel, le même rendement et finissent le même jour ; le départ retardé verse moins, parce qu'il commence plus tard. On affiche son total versé, son solde à la fin des dépôts, son solde final, et :

`dépôts que vous ne faites pas = total versé − total versé du départ retardé`

`ce que coûte l'attente = solde final − solde final du départ retardé`

Une attente égale ou supérieure aux années de dépôts est signalée dans le formulaire : le départ retardé ne déposerait rien.

## Dollars d'aujourd'hui

Option désactivée par défaut. Quand elle est active, les fonctions de `shared/engine/inflation.ts` sont reprises :

- un solde au mois m est divisé par `(1 + inflation)^(m ÷ 12)` ;
- le total versé ramène chaque dépôt depuis son propre mois (`presentValueFactor`), et le montant de départ depuis le mois où il est placé ;
- les intérêts gagnés sont la différence de ces deux montants ramenés ;
- le graphique suit la même conversion.

Comme dans les autres outils, la phrase principale montre le montant de l'époque, puis une étape donne sa valeur d'aujourd'hui.

## Limites

- Le rendement est le même chaque année. Un vrai placement monte et descend ; l'ordre des bonnes et des mauvaises années change le résultat quand on dépose ou retire en cours de route.
- Aucun impôt ni frais de gestion. Pour les frais, l'outil « Frais de gestion » les compare.
- Le dépôt mensuel ne suit pas l'inflation.

## Page publique

`/epargne/methode` explique ce modèle au public, avec la date de sa dernière mise à jour (`savings.method.updated`).

La page montre aussi le calcul en notation mathématique (MathML), dans `src/app/epargne/method/savings-formula.html`, avec le sens de chaque symbole. Ces formules sont écrites à la main : **tout changement du calcul dans le moteur met à jour la formule MathML et ses symboles dans le même changement**, pour qu'il n'y ait jamais d'écart entre ce qui est affiché et ce qui est exécuté.

## Bornes des saisies

Le minimum et le maximum de chaque saisie sont dans [Limites des champs](limites-des-champs.md).
