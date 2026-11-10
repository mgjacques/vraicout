# Modèle de calcul : taux d'imposition marginal au Québec

Le code est dans `src/app/impot/engine/`. Les chiffres sont ceux de l'année d'imposition 2026.

## Revenu entré

La personne entre son **revenu imposable** de l'année : la ligne 26000 de la déclaration fédérale, ou la ligne 299 de la déclaration du Québec. Pour un salaire sans autre revenu ni déduction, c'est à peu près le salaire brut. L'outil prend le même revenu pour les deux paliers et le traite comme un revenu d'emploi ou de retraite ordinaire (ni dividende, ni gain en capital).

Le taux marginal est celui du **dollar suivant** : le taux qui s'applique au premier dollar gagné au-dessus du revenu entré. À un seuil exact (58 523 $, par exemple), c'est donc le taux de la tranche du dessus.

## Impôt du Québec

Tranches 2026 (ministère des Finances du Québec, _Paramètres du régime d'imposition des particuliers pour 2026_) :

| Revenu imposable         | Taux    |
| ------------------------ | ------- |
| jusqu'à 54 345 $         | 14 %    |
| de 54 345 $ à 108 680 $  | 19 %    |
| de 108 680 $ à 132 245 $ | 24 %    |
| plus de 132 245 $        | 25,75 % |

`impôt du Québec = max(0, impôt des tranches − 14 % × 18 952 $)`

18 952 $ est le montant personnel de base, crédité au taux de la première tranche. Sous ce revenu, l'impôt du Québec est nul et son taux marginal est 0 %.

## Impôt fédéral

Tranches 2026 (Agence du revenu du Canada) :

| Revenu imposable         | Taux   |
| ------------------------ | ------ |
| jusqu'à 58 523 $         | 14 %   |
| de 58 523 $ à 117 045 $  | 20,5 % |
| de 117 045 $ à 181 440 $ | 26 %   |
| de 181 440 $ à 258 482 $ | 29 %   |
| plus de 258 482 $        | 33 %   |

Le montant personnel de base fédéral vaut 16 452 $ jusqu'à 181 440 $ de revenu, puis diminue en ligne droite jusqu'à 14 829 $ à 258 482 $ :

`montant personnel = 14 829 $ + 1 623 $ × (258 482 $ − revenu) ÷ 77 042 $`, borné entre 14 829 $ et 16 452 $.

Une personne qui habite au Québec a droit à l'abattement du Québec : 16,5 % de l'impôt fédéral de base est retranché, parce que le Québec finance lui-même certains programmes.

`impôt fédéral = max(0, impôt des tranches − 14 % × montant personnel) × (1 − 16,5 %)`

## Taux marginal

`taux marginal = taux fédéral × (1 − 16,5 %) + taux du Québec`

où chaque taux est celui de la tranche du dollar suivant, ou 0 % tant que l'impôt du palier est nul. Entre 181 440 $ et 258 482 $, chaque dollar de plus réduit aussi le montant personnel fédéral, ce qui ajoute :

`perte de crédit = 14 % × 1 623 $ ÷ 77 042 $ × (1 − 16,5 %) ≈ 0,25 %`

| Revenu imposable         | Fédéral (après abattement) | Québec  | Combiné |
| ------------------------ | -------------------------- | ------- | ------- |
| jusqu'à 16 452 $         | 0 %                        | 0 %     | 0 %     |
| de 16 452 $ à 18 952 $   | 11,69 %                    | 0 %     | 11,69 % |
| de 18 952 $ à 54 345 $   | 11,69 %                    | 14 %    | 25,69 % |
| de 54 345 $ à 58 523 $   | 11,69 %                    | 19 %    | 30,69 % |
| de 58 523 $ à 108 680 $  | 17,12 %                    | 19 %    | 36,12 % |
| de 108 680 $ à 117 045 $ | 17,12 %                    | 24 %    | 41,12 % |
| de 117 045 $ à 132 245 $ | 21,71 %                    | 24 %    | 45,71 % |
| de 132 245 $ à 181 440 $ | 21,71 %                    | 25,75 % | 47,46 % |
| de 181 440 $ à 258 482 $ | 24,46 %                    | 25,75 % | 50,21 % |
| plus de 258 482 $        | 27,56 %                    | 25,75 % | 53,31 % |

Les seuils où l'impôt d'un palier commence (16 452 $ et 18 952 $) sont ceux où le crédit du montant personnel est épuisé : ils découlent du calcul, ils ne sont pas codés à part.

## Taux moyen

`taux moyen = (impôt fédéral + impôt du Québec) ÷ revenu`

Un revenu de 0 $ donne un taux moyen de 0 %.

## Revenu de plus

Un montant facultatif, ajouté au revenu (une augmentation, des heures supplémentaires, un contrat) :

- `impôt de plus = impôt total (revenu + montant) − impôt total (revenu)`
- `ce qui reste = montant − impôt de plus`
- `taux sur ce montant = impôt de plus ÷ montant`

Quand le montant franchit un seuil, le taux sur ce montant se trouve entre deux taux marginaux.

## Graphique

Le taux marginal combiné en escalier, de 0 $ à 300 000 $ de revenu imposable, avec un trait plein au revenu entré et un trait pointillé à la fin du revenu de plus, s'il y en a un. Les marches sont calculées comme pour un revenu entré, à chaque seuil (`rateSteps`). Au-delà de 300 000 $ le taux ne change plus ; un revenu plus élevé place le trait au bord droit, et une phrase sous le graphique le dit. Un tableau repliable donne les mêmes marches, fédéral et Québec à part, la ligne du revenu entré en évidence.

## Chiffres de départ

Revenu imposable de 70 000 $ (taux marginal de 36,12 %) et revenu de plus de 5 000 $.

## Limites

- Seul l'impôt sur le revenu est compté. Les cotisations au RRQ, à l'assurance-emploi et au RQAP, et la cotisation au Fonds des services de santé, ne le sont pas.
- Seuls les montants personnels de base sont crédités. Les autres crédits (montant canadien pour emploi, travailleur d'expérience, frais médicaux, dons) et les déductions ne sont pas pris en compte.
- Les prestations et crédits qui diminuent avec le revenu (allocation famille, crédit pour la solidarité, allocation canadienne pour enfants, prime au travail) ne sont pas comptés. Pour une famille ou un revenu modeste, ils peuvent faire monter le taux réel bien au-dessus de celui affiché.
- Les dividendes et les gains en capital ont leurs propres règles ; l'outil ne les calcule pas.
- Le revenu net est supposé égal au revenu imposable pour la réduction du montant personnel fédéral.
- L'impôt minimum de remplacement n'est pas calculé.

## Page publique

`/impot/methode` explique ce modèle au public, avec la date de sa dernière mise à jour (`marginal.method.updated`). Elle se met à jour avec ce document. Sources : le document des paramètres 2026 du ministère des Finances du Québec et la page des taux et seuils 2026 de l'ARC.

## Bornes des saisies

Le minimum et le maximum de chaque saisie sont dans [Limites des champs](limites-des-champs.md).
