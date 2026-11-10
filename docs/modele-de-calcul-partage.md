# Modèle de calcul : partage des dépenses

Le code est dans `src/app/partage/engine/split.ts`.

## Revenu annuel

Chaque salaire est ramené à l'année avant d'être comparé, pour que deux personnes payées à des rythmes différents se comparent.

| Fréquence          | Paies par année |
| ------------------ | --------------- |
| À l'année          | 1               |
| Au mois            | 12              |
| Deux fois par mois | 24              |
| Aux deux semaines  | 26              |
| À la semaine       | 52              |

`revenu annuel = montant de la paie × paies par année`

## Partage

`part de la personne 1 = revenu 1 ÷ (revenu 1 + revenu 2)`

- Le partage est donné sans arrondi (une décimale à l'écran), arrondi au point (les deux parts font toujours 100) et arrondi au 5 près (« 60 / 40 »).
- Une facture entrée est partagée selon la part exacte : `facture × part`. Chaque personne consacre ainsi la même part de son revenu aux dépenses communes.
- Un revenu peut valoir 0 (l'autre personne paie tout) ; les deux à 0 ne donnent pas de partage, le formulaire les signale comme manquants.

## Net ou brut

Un seul salaire par personne : l'outil ne sait pas s'il est brut ou net, et ne calcule aucun impôt. La section « Net ou brut ? » de la page explique le choix et demande le même type pour les deux personnes.

- **Brut** : simple, stable, facile à trouver.
- **Net** : le salaire moins l'impôt, la RRQ, l'assurance emploi et le RQAP, sans les retenues volontaires (REER collectif, assurances facultatives, dons). L'impôt étant progressif, le partage selon le net est en général moins écarté que selon le brut : selon le brut, la personne qui gagne le plus consacre aux dépenses communes une part un peu plus grande de son revenu disponible.

## Page publique

`/partage/methode` explique ce modèle au public, avec la date de sa dernière mise à jour (`split.method.updated`). Elle se met à jour avec ce document. Une seule source : les taux d'imposition du Québec (Revenu Québec), pour l'impôt progressif qui rapproche deux salaires nets. Les fréquences de paie et les salaires de départ (75 000 $ et 55 000 $) n'en ont pas besoin.

## Bornes des saisies

Le minimum et le maximum de chaque saisie sont dans [Limites des champs](limites-des-champs.md).
