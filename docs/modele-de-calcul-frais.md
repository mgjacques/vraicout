# Modèle de calcul : frais de gestion

Le moteur est dans `src/app/frais/engine/`. Comme celui de l'assurance, il est pur : aucune dépendance à Angular ni au DOM. Point d'entrée : `projectFees(input)` dans `fees.ts`. Tout est verrouillé par `fees.spec.ts`.

## Principe

Deux placements reçoivent **les mêmes dépôts** et ont **le même rendement avant frais**. Seuls les frais changent. On compare ce qu'il reste à la retraite, puis le revenu qu'on peut en tirer. Le rendement est le même des deux côtés exprès : l'outil mesure le coût des frais, pas la qualité d'un fonds.

## Entrées (`FeesInput`)

| Champ                                | Sens                                                         | Bornes     |
| ------------------------------------ | ------------------------------------------------------------ | ---------- |
| `initialAmount`                      | Placé au mois 0                                              | ≥ 0        |
| `monthlyContribution`                | Ajouté à la fin de chaque mois d'épargne                     | ≥ 0        |
| `years`                              | Années d'épargne avant la retraite                           | 1 à 60     |
| `grossReturn`                        | Rendement annuel avant frais, le même pour A et B            | 0 à 15 %   |
| `portfolios.a/b.mer`                 | Ratio des frais de gestion (RFG)                             | 0 à 5 %    |
| `portfolios.a/b.advisorFee`          | Frais de conseiller ou de plateforme, en plus du RFG         | 0 à 3 %    |
| `account`, `taxRate`, `taxRateLater` | Compte et taux, comme dans l'outil assurance                 | 0 à 60 %   |
| `inflation`, `realDollars`           | Indexation des retraits ; affichage en dollars d'aujourd'hui | 0 à 10 %   |
| `drawdown.enabled`, `.years`         | Calculer un revenu de retraite, et sur combien d'années      | 1 à 50 ans |

Les valeurs hors bornes sont ramenées dans les bornes (`sanitize`).

## Épargne : la boucle mensuelle

Trois soldes avancent en parallèle : A, B, et une **référence sans frais**. Pour chacun, avec `f` = RFG + frais de conseiller :

```
solde[0] = dépôt de départ × majoration REER
chaque mois m ≥ 1 :
  croissance = solde[m−1] × (1 + rendement)^(1/12)
  frais      = croissance × (1 − (1 − f)^(1/12))
  solde[m]   = croissance − frais + cotisation × majoration REER
```

- Le rendement et les frais sont des **taux effectifs annuels**, comme dans les outils assurance et épargne : sur douze mois, le placement croît exactement du rendement entré, et les frais en retirent exactement `f`. Chacun est converti en son équivalent mensuel (`toMonthlyRate`, dans `shared/engine/rates.ts`, et `monthlyFeeRate`). Intérêt avant le dépôt.
- Sur un an, le solde est donc multiplié par `(1 + rendement) × (1 − f)` : 6 % de rendement et 2 % de frais donnent 3,88 % après frais (`netYearlyRate`), pas 4 %. La formule affichée sous chaque solde le dit.
- Pour un dépôt unique, le solde vaut `départ × ((1 + rendement)(1 − f))^années`. Un test le vérifie.
- **REER** : chaque dépôt est majoré de `1 / (1 − taux)`, parce que le remboursement d'impôt est replacé (`rrspGrossUp`, partagé avec l'assurance).

## Montants affichés

| Montant              | Calcul                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Valeur à la retraite | Le solde au dernier mois d'épargne, avant impôt.                                                                                    |
| En main              | Le même solde après impôt si tout était retiré (`afterTax`, partagé avec l'assurance).                                              |
| Frais payés          | La somme des frais prélevés chaque mois.                                                                                            |
| Coût des frais       | Solde sans frais − solde du placement : les frais, **plus** la croissance qu'ils auraient produite. Aussi en % du solde sans frais. |
| Revenu de retraite   | Le premier retrait mensuel, après impôt (voir plus bas).                                                                            |

## Retraite : retraits indexés

Si le décaissement est activé, chaque placement verse un retrait mensuel qui **augmente avec l'inflation** et **vide le placement au dernier mois**. Les frais continuent d'être prélevés ; le rendement est le même.

Avec `r` le rendement mensuel après frais, `(1 + rendement)^(1/12) × (1 − f)^(1/12) − 1`, et `i` l'inflation mensuelle, le premier retrait `w` vérifie :

```
solde = Σ w (1 + i)^(k−1) / (1 + r)^k,  k = 1..M
w = solde × (1 + r) × (1 − q) / (1 − q^M),  où q = (1 + i) / (1 + r)
```

(`firstWithdrawal`, avec le cas `q = 1` traité à part.) En dollars d'aujourd'hui, le revenu reste donc constant pendant toute la retraite.

**Impôt sur le revenu.** On applique à chaque retrait la même part d'impôt qu'à un retrait complet au début de la retraite : 0 en CELI, le taux plus tard en REER, et pour un compte non enregistré la part du gain en capital à ce moment-là. C'est exact pour le CELI et le REER, et une approximation pour le non enregistré.

## Dollars d'aujourd'hui

- Un solde est ramené depuis son mois (`discountFactor`), avec l'étape `formula.real.value` partagée.
- Les montants payés au fil du temps (frais, dépôts, retraits) sont ramenés **chacun depuis son propre mois**, avec l'étape `formula.fees.real.flow`.

## Explications

Chaque montant est un `Money` avec une phrase `formula.fees.*` et ses étapes (impôt, dollars d'aujourd'hui). Un test vérifie que chaque phrase existe dans le catalogue et que chacun de ses `{paramètres}` est fourni.

## Limites

La page `/frais/methode` explique ce modèle au public, en langage courant, avec la source de chaque repère (rendement, RFG moyens, inflation, règles d'impôt). Un changement ici la met à jour aussi, avec sa date de dernière mise à jour (`fees.method.updated`).

La page montre aussi le calcul en notation mathématique (MathML), dans `src/app/frais/method/fees-*-formula.html`, avec le sens de chaque symbole. Ces formules sont écrites à la main : **tout changement du calcul dans le moteur met à jour la formule MathML et ses symboles dans le même changement**, pour qu'il n'y ait jamais d'écart entre ce qui est affiché et ce qui est exécuté.

- Le rendement est constant ; en réalité, il varie d'une année à l'autre, et l'ordre des bonnes et mauvaises années compte à la retraite.
- Les frais sont prélevés chaque mois, au taux qui retire `f` sur un an. Les fonds les calculent en général chaque jour ; l'écart est négligeable.
- Hors CELI et REER : pas d'impôt annuel sur les distributions, pas de déduction des frais de conseiller ; l'impôt n'est calculé qu'au retrait.
- Les plafonds de cotisation CELI et REER ne sont pas vérifiés.
- La valeur d'un conseil (planification, accompagnement) n'est pas mesurée ; l'outil le dit dans la page.

## Bornes des saisies

Le minimum et le maximum de chaque saisie sont dans [Limites des champs](limites-des-champs.md).
