# Chiffres à mettre à jour chaque année

Plusieurs outils reposent sur des chiffres publiés chaque année par les gouvernements ou par des organismes : les tranches d'impôt, les normes de projection, les taxes. Cette page les liste tous, avec l'endroit où chacun est défini dans le code, les textes, la doc et les tests qui le recopient, et la source où trouver la nouvelle valeur.

Un chiffre n'est presque jamais à un seul endroit. La constante du moteur fait le calcul, mais les pages Méthode, les aides des champs et les modèles de calcul l'écrivent aussi en toutes lettres, et aucun test ne compare ces textes au moteur. Changer la constante sans les textes laisse le site afficher un chiffre et en calculer un autre.

Tout chiffre ajouté qui change d'une année à l'autre s'ajoute à cette page dans le même changement.

## Calendrier

| Quand                    | Quoi                                                                          | Section                                       |
| ------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------- |
| Novembre à décembre      | Tranches et montants personnels de l'année suivante, Québec et fédéral        | [Impôt sur le revenu](#impôt-sur-le-revenu)   |
| Décembre à janvier       | Feuille de travail TD1-WS de la nouvelle année                                | [Impôt sur le revenu](#impôt-sur-le-revenu)   |
| Printemps (avril-mai)    | Normes d'hypothèses de projection de l'IQPF et de FP Canada                   | [Normes de projection](#normes-de-projection) |
| Chaque année, à vérifier | Taxes de vente, abattement, inclusion des gains en capital, cible d'inflation | [À vérifier](#chiffres-stables-à-vérifier)    |
| Au besoin                | RFG moyens des fonds communs et des FNB                                       | [Chiffres ponctuels](#chiffres-ponctuels)     |

Les tranches de l'année suivante sont connues à l'automne, avant le 1er janvier. On peut les mettre en ligne dès janvier : l'outil `/impot` affiche l'année de ses chiffres (`TAX_YEAR`).

## Impôt sur le revenu

Année en vigueur : **2026**.

### Les valeurs

Toutes dans `src/app/impot/engine/brackets.ts`.

| Constante             | Valeur 2026                                                                                                       | Source                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `TAX_YEAR`            | 2026                                                                                                              | —                                |
| `QUEBEC_BRACKETS`     | 14 % jusqu'à 54 345 $, 19 % jusqu'à 108 680 $, 24 % jusqu'à 132 245 $, 25,75 % au-delà                            | Ministère des Finances du Québec |
| `QUEBEC_BASIC_AMOUNT` | 18 952 $                                                                                                          | Ministère des Finances du Québec |
| `QUEBEC_CREDIT_RATE`  | 14 % (le taux de la première tranche)                                                                             | Ministère des Finances du Québec |
| `FEDERAL_BRACKETS`    | 14 % jusqu'à 58 523 $, 20,5 % jusqu'à 117 045 $, 26 % jusqu'à 181 440 $, 29 % jusqu'à 258 482 $, 33 % au-delà     | ARC                              |
| `FEDERAL_BASIC`       | 16 452 $ au maximum, 14 829 $ au minimum, baisse entre 181 440 $ et 258 482 $ (les deux derniers seuils fédéraux) | ARC, TD1-WS                      |
| `FEDERAL_CREDIT_RATE` | 14 % (le taux de la première tranche)                                                                             | ARC                              |
| `QUEBEC_ABATEMENT`    | 16,5 %                                                                                                            | ARC (stable depuis longtemps)    |

Sources (dans `src/app/impot/method/marginal-method.ts`) :

- Ministère des Finances du Québec, paramètres du régime d'imposition : l'adresse contient l'année (`AUTFR_RegimeImpot2026.pdf`), elle change donc chaque année.
- ARC, taux d'imposition et tranches de revenu : l'adresse `annee-en-cours.html` reste la même, mais vérifier qu'elle montre bien la nouvelle année.
- ARC, feuille de travail TD1-WS : l'adresse contient l'année (`td1-ws-26f.pdf`).

### Ce qui en découle

Ces chiffres ne sont pas des constantes, mais ils sortent du calcul et sont écrits ailleurs à la main :

- les taux marginaux combinés de chaque palier (36,12 % de 58 523 $ à 108 680 $, 53,31 % au sommet…) ;
- la perte de crédit entre les deux derniers seuils fédéraux (environ 0,25 %) ;
- le taux d'impôt de départ de l'assurance (voir plus bas).

Pour obtenir les nouveaux taux combinés, lancer les tests après avoir changé `brackets.ts` : ceux qui échouent donnent les nouvelles valeurs, et le tableau de `docs/modele-de-calcul-impot.md` se recalcule avec la formule qui y est écrite.

### Les endroits à mettre à jour

| Fichier                                   | Ce qu'il contient                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/impot/engine/brackets.ts`        | Les constantes, et l'année dans leurs commentaires.                                                                                                                                                                                                                                                                                                            |
| `src/app/impot/method/marginal-method.ts` | Les adresses des trois sources.                                                                                                                                                                                                                                                                                                                                |
| `src/app/shared/i18n/fr/marginal.ts`      | `marginal.method.calc.quebec`, `.federal`, `.phase`, `.zero`, `.abatement` : toutes les tranches et tous les montants en toutes lettres. `marginal.method.symbol.p` et `.a`. `marginal.method.ref.quebec` (le taux d'indexation, 2,05 % pour 2026), `.ref.federal`, `.source.quebec`, `.source.federal`, `.source.basic` (l'année). `marginal.method.updated`. |
| `src/app/shared/i18n/fr/split.ts`         | `split.method.ref.progressive` : « Au Québec en 2026, il passe de 14 % à 25,75 % ». `split.method.updated`.                                                                                                                                                                                                                                                    |
| `src/app/shared/i18n/fr/assurance.ts`     | `insurance.method.ref.tax` : l'année, les seuils de la tranche à 36 % et la fourchette « d'environ 26 % à 53 % ». `insurance.method.updated`.                                                                                                                                                                                                                  |
| `src/app/assurance/engine/blank.ts`       | `DEFAULT_TAX_RATE` (36 %) et son commentaire : le taux combiné de la tranche de 58 523 $ à 108 680 $, arrondi. Si l'arrondi change, `docs/limites-des-champs.md` (« 36 % par défaut ») aussi.                                                                                                                                                                  |
| `docs/modele-de-calcul-impot.md`          | Les tableaux des tranches, le montant personnel, la perte de crédit, le tableau des taux combinés et l'exemple chiffré.                                                                                                                                                                                                                                        |
| `docs/modele-de-calcul.md`                | La ligne « Taux d'imposition de départ ».                                                                                                                                                                                                                                                                                                                      |
| `src/app/impot/engine/marginal.spec.ts`   | Les calculs écrits en commentaire et les valeurs attendues aux seuils.                                                                                                                                                                                                                                                                                         |
| `src/app/app.spec.ts`                     | Le taux affiché pour le revenu de départ (`36,12 %`).                                                                                                                                                                                                                                                                                                          |

Le taux de la première tranche (14 %) sert aussi de taux des crédits aux deux paliers. Si une tranche du bas change de taux, vérifier que le crédit suit (le fédéral l'a déjà fait entre 15 % et 14 %).

## Normes de projection

Année en vigueur : **2026**. L'Institut de planification financière (IQPF) et FP Canada publient leurs normes d'hypothèses de projection chaque printemps. Les taux sont avant frais.

| Valeur 2026                              | Où dans le code                                                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Court terme : 2,4 %                      | `RETURN_MARKERS.shortTerm`, `src/app/assurance/engine/limits.ts`                                            |
| Revenu fixe (obligations) : 3,2 %        | `RETURN_MARKERS.bonds`, même fichier. C'est aussi le rendement de départ de l'assurance (`DEFAULT_RETURN`). |
| Actions : 6,3 % à 6,6 % (repère à 6,5 %) | `RETURN_MARKERS.equities`, même fichier                                                                     |

Source : <https://institutpf.org/normes-hypotheses-projection> (même adresse chaque année), citée par les pages Méthode de l'assurance, des frais, de l'épargne et des dépenses fréquentes.

Les endroits à mettre à jour :

| Fichier                               | Ce qu'il contient                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/assurance/engine/limits.ts`  | `RETURN_MARKERS` et son commentaire.                                                                                                                                |
| `src/app/shared/i18n/fr/assurance.ts` | `drawer.tick.bonds` (« Obligations ≈ 3,2 % »), `insurance.method.ref.return` (l'année et les trois taux), `insurance.method.updated`.                               |
| `src/app/shared/i18n/fr/fees.ts`      | `fees.method.ref.return` (l'année, les taux et le portefeuille 60/40 « environ 5 % »), `fees.form.returnHelp` (« environ 5 % avant frais »), `fees.method.updated`. |
| `src/app/shared/i18n/fr/savings.ts`   | `savings.method.ref.return` (l'année et les taux), `savings.method.updated`.                                                                                        |
| `src/app/shared/i18n/fr/spending.ts`  | `spending.method.ref.return` (l'année et les taux des actions), `spending.method.updated`.                                                                          |
| `docs/modele-de-calcul.md`            | La ligne « Curseur de rendement ».                                                                                                                                  |
| `docs/limites-des-champs.md`          | « 3,2 % par défaut » et les repères du curseur.                                                                                                                     |
| `docs/personas.md`                    | Les personas qui gardent le rendement de départ (« rendement 3,2 % »).                                                                                              |

Les rendements de départ de l'épargne et des frais (6 %) et des dépenses fréquentes (7 %) sont des chiffres ronds, sans source : ils ne suivent pas les normes. Si les normes s'en éloignent beaucoup, en discuter avant d'y toucher.

## Chiffres stables, à vérifier

Ces chiffres changent rarement, mais une décision gouvernementale peut les changer d'une année à l'autre. Un coup d'œil chaque année suffit.

| Chiffre                                  | Valeur                        | Où dans le code                                                                                                                                                    | Textes et doc qui le recopient                                                                                                                                                                                   | Source                          |
| ---------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| TPS et TVQ                               | 5 % et 9,975 %, soit 14,975 % | `SALES_TAX`, `src/app/heures/engine/types.ts`                                                                                                                      | `hours.ts` (aide de la case et `hours.method.*`), `docs/modele-de-calcul-heures.md`, `heures/engine/hours.spec.ts`                                                                                               | Revenu Québec, calcul des taxes |
| Abattement du Québec                     | 16,5 %                        | `QUEBEC_ABATEMENT`, `src/app/impot/engine/brackets.ts`                                                                                                             | Voir [Impôt sur le revenu](#impôt-sur-le-revenu)                                                                                                                                                                 | ARC                             |
| Part imposable d'un gain en capital      | 50 %                          | `CAPITAL_GAIN_INCLUSION`, `src/app/shared/engine/tax.ts`                                                                                                           | `common.ts` (« la moitié du gain », dans `formula.tax.taxable` et l'aide du compte ordinaire), `fees.ts`, `assurance.ts`, les modèles de calcul de l'assurance et des frais, `shared/engine/tax.ts` et ses tests | ARC                             |
| Cible d'inflation de la Banque du Canada | 2 %                           | `inflation: 0.02` dans les `blank.ts` de l'assurance, de l'épargne et des frais, et dans `assurance/engine/project.ts` et `frais/engine/fees.ts` (valeur de repli) | `common.ts` (`drawer.inflationHelp`, `method.ref.inflation`, `sources.inflation`), `docs/limites-des-champs.md`                                                                                                  | Banque du Canada                |

La cible d'inflation est fixée par une entente de cinq ans entre la Banque du Canada et le gouvernement. Celle en vigueur couvre 2022 à 2026 : vérifier la nouvelle entente quand elle est annoncée.

Une hausse de la part imposable des gains en capital a déjà été annoncée puis abandonnée, en 2024-2025. Si elle revient, le changement touche le calcul du compte ordinaire dans trois outils et demande une décision, pas seulement un nouveau chiffre.

## Chiffres ponctuels

Ces chiffres viennent d'une étude datée. Ils ne changent qu'à la parution d'une étude plus récente.

| Chiffre    | Valeur                                        | Où                                                      | Source                                                                                                             |
| ---------- | --------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| RFG moyens | 1,47 % (fonds communs), 0,32 % (FNB), en 2023 | `fees.method.ref.mer`, `src/app/shared/i18n/fr/fees.ts` | Rapport du Conference Board du Canada pour l'IFIC, cité par _Investment Executive_ (`frais/method/fees-method.ts`) |

Les RFG de départ des deux placements des frais (2,2 % et 0,25 %) sont des chiffres ronds pour un fonds commun et un FNB indiciel, sans source : ils ne suivent pas cette étude.

## Ce qui ne change pas avec les années

Pour éviter de les chercher : les chiffres de départ de l'hypothèque, du partage, des heures et de l'impôt (montants, taux, salaires) sont des exemples ronds sans source, à remplacer par la personne. Les bornes des champs (`engine/limits.ts`) sont larges exprès et n'ont pas à suivre l'actualité, sauf le plafond du taux d'imposition (60 %), à garder au-dessus du taux marginal le plus élevé au Québec. L'année courante de l'assurance (âge à partir de l'année de naissance) vient de l'horloge du navigateur.

## Marche à suivre

1. Changer les constantes du moteur.
2. Lancer `npx ng test --watch=false` : les tests qui échouent montrent les valeurs calculées qui ont bougé. Mettre à jour leurs valeurs attendues et les calculs écrits en commentaire.
3. Reprendre chaque fichier des tableaux ci-dessus. Pour ne rien oublier, chercher les anciennes valeurs dans tout le dépôt, avec et sans espace de milliers :

   ```bash
   grep -rnE "54.?345|58.?523|2026" src docs
   ```

4. Changer les adresses de sources qui contiennent l'année, et vérifier qu'elles répondent.
5. Mettre à jour la date « Dernière mise à jour » (`*.method.updated`) de chaque page Méthode touchée.
6. Mettre à jour l'année en vigueur en haut de chaque section de cette page.
7. `npm run build`, puis vérifier dans le navigateur la page `/impot` et les pages Méthode touchées.
