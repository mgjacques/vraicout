# Modèle de calcul : dépenses fréquentes

Le code est dans `src/app/depenses/engine/spending.ts`. L'outil ramène une dépense qui revient souvent (un café, un dîner au restaurant, un abonnement) à l'année, la projette sur plusieurs années, puis montre ce que les mêmes sommes vaudraient si elles avaient été placées. Il ne calcule ni taxes ni impôt : le montant entré est celui qui est payé.

## Saisies

- Montant payé chaque fois.
- Fréquence : un nombre X et l'une de six formes, « X fois par jour », « aux X jours », « X fois par semaine », « aux X semaines », « X fois par mois », « aux X mois ». X est un nombre entier.
- Nombre d'années de la projection.
- Rendement annuel espéré du placement, 7 % par défaut.
- Hausse des prix : une case « Suivre l'inflation » et un taux d'inflation, 2 % par défaut. Case décochée par défaut.

Chiffres de départ : 5 $, 5 fois par semaine, 10 ans, 7 %, sans hausse des prix.

## Fois par année

L'année compte 365 jours, 52 semaines et 12 mois.

| Forme              | Fois par année |
| ------------------ | -------------- |
| X fois par jour    | `X × 365`      |
| aux X jours        | `365 ÷ X`      |
| X fois par semaine | `X × 52`       |
| aux X semaines     | `52 ÷ X`       |
| X fois par mois    | `X × 12`       |
| aux X mois         | `12 ÷ X`       |

Le résultat n'est pas arrondi : « aux 3 semaines » donne 17,33 fois par année.

## Coût par année

`coût par année = montant × fois par année`

C'est le coût de la première année. Sans hausse des prix, c'est celui de chaque année.

## Coût sur N années

Avec la hausse des prix, le montant augmente une fois par année, au début de chaque nouvelle année : l'année k (de 1 à N) coûte `coût par année × (1 + inflation)^(k − 1)`.

- Sans hausse : `coût sur N années = coût par année × N`
- Avec hausse : `coût sur N années = coût par année × ((1 + inflation)^N − 1) ÷ inflation`

## Valeur placée (coût d'opportunité)

Les mêmes sommes, placées au lieu d'être dépensées. Chaque mois, le douzième du coût de l'année en cours est déposé, à la fin du mois, après l'intérêt. C'est la convention de l'outil « Épargne dans le temps ».

Le rendement entré est un taux effectif annuel, converti en taux mensuel équivalent (`toMonthlyRate`, dans `shared/engine/rates.ts`) :

`taux mensuel i = (1 + rendement)^(1/12) − 1`

`solde(m) = solde(m − 1) × (1 + i) + coût de l'année en cours ÷ 12`, avec `solde(0) = 0`

Sans hausse des prix, la boucle donne la formule fermée qui sert à la phrase : `dépôt mensuel × ((1 + i)^(N × 12) − 1) ÷ i`.

La valeur placée est le chiffre affiché sous « Coût d'opportunité ». Sous elle, « Intérêts gagnés » donne la part qui vient des intérêts :

`intérêts = valeur placée − coût sur N années`

## Exemple : les chiffres de départ

- Fois par année : 5 × 52 = 260
- Coût par année : 5 $ × 260 = 1 300 $
- Coût sur 10 ans : 1 300 $ × 10 = 13 000 $
- Taux mensuel : 1,07^(1/12) − 1 = 0,5654 %
- Valeur placée : 108,33 $ × (1,07^10 − 1) ÷ 0,005654 = 18 531 $, dont 5 531 $ d'intérêts

## Limites

- Le rendement est le même chaque année. Un vrai placement monte et descend, et rien n'est garanti.
- Aucun impôt ni frais sur le placement. Placé dans un CELI, il n'y aurait pas d'impôt ; ailleurs, il y en aurait.
- La hausse des prix est la même chaque année et s'applique d'un coup au début de l'année.
- Les montants ne sont pas ramenés en dollars d'aujourd'hui.
- Une semaine de 52 semaines et une année de 365 jours ne tombent pas pile : « 1 fois par jour » donne 365 fois, « 7 fois par semaine » en donne 364.

## Page publique

`/depenses/methode` explique ce modèle au public, avec la date de sa dernière mise à jour (`spending.method.updated`). Elle se met à jour avec ce document.

## Bornes des saisies

Le minimum et le maximum de chaque saisie sont dans [Limites des champs](limites-des-champs.md).
