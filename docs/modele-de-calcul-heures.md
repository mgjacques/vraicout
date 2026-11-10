# Modèle de calcul : prix en heures de travail

Le code est dans `src/app/heures/engine/hours.ts`.

## Paie nette par année

La paie entrée est la paie **nette**, ce qui arrive dans le compte. L'outil ne calcule aucun impôt. Elle est ramenée à l'année avec les mêmes fréquences que le partage des dépenses (`src/app/shared/engine/pay.ts`) : 1, 12, 24, 26 ou 52 paies.

`paie nette par année = paie × paies par année`

## Frais liés au travail

Les frais liés au travail (transport, stationnement, garde, dîners), entrés par mois, sont soustraits. Le champ est facultatif ; vide, il vaut 0.

`ce qui reste = paie nette par année − frais par mois × 12`

Des frais égaux ou supérieurs à la paie ne donnent pas de résultat : le formulaire les signale.

## Paie à l'heure

L'année compte 52 semaines, puisque les vacances payées sont comprises dans la paie.

`paie à l'heure = ce qui reste ÷ (heures par semaine × 52)`

## Prix et heures

Les taxes, si la case est cochée, sont celles du Québec : TPS 5 % et TVQ 9,975 %, soit 14,975 % calculés sur le prix avant taxes.

- `prix payé = prix × 1,14975` (ou le prix tel quel)
- `heures de travail = prix payé ÷ paie à l'heure`
- `journées de travail = heures ÷ (heures par semaine ÷ 5)`

Un prix payé chaque mois donne les heures par mois, puis par année (`× 12`). Un prix payé chaque année donne directement les heures par année.

## Limites

- Les heures supplémentaires, les primes et le temps de transport ne sont pas comptés.
- Le taux de taxes est fixe ; certains achats en sont exemptés (épicerie de base, par exemple).
- Les heures et les journées sont affichées à une décimale, dans le montant comme dans la formule.

## Page publique

`/heures/methode` explique ce modèle au public, avec la date de sa dernière mise à jour (`hours.method.updated`). Elle se met à jour avec ce document. Une seule source : le calcul de la TPS et de la TVQ (Revenu Québec). Les 52 semaines, la journée de cinq jours et les chiffres de départ n'en ont pas besoin.

## Bornes des saisies

Le minimum et le maximum de chaque saisie sont dans [Limites des champs](limites-des-champs.md).
