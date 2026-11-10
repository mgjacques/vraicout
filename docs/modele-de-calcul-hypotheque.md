# Modèle de calcul : assurance hypothécaire

Le moteur est dans `src/app/hypotheque/engine/`. Comme les autres, il est pur : aucune dépendance à Angular ni au DOM. Points d'entrée : `projectMortgage(input)` et `deathAt(projection, année, personne)` dans `mortgage.ts`. Tout est verrouillé par `mortgage.spec.ts`.

## Principe

Pour protéger un prêt hypothécaire en cas de décès, on compare deux options :

- une **assurance temporaire personnelle** : un montant fixe, versé à la personne choisie, jusqu'à la fin de sa durée ;
- l'**assurance vie hypothécaire de la banque** : elle verse le solde du prêt, à la banque, et en couple une seule fois, au premier décès.

Les deux sont comparées sur **les années du prêt**, avec les primes telles que soumises. Il n'y a ni placement de la différence ni dollars d'aujourd'hui : l'outil compare des primes et des sommes versées.

## Entrées (`MortgageInput`)

| Champ                                       | Sens                                                            | Bornes       |
| ------------------------------------------- | --------------------------------------------------------------- | ------------ |
| `loan.amount`                               | Montant emprunté, ou solde actuel d'un prêt en cours            | ≥ 0          |
| `loan.years`                                | Amortissement, ou années qui restent                            | 1 à 40       |
| `loan.rate`                                 | Taux affiché, composé deux fois par année                       | 0 à 15 %     |
| `couple`                                    | Deux emprunteurs                                                |              |
| `people.p1/p2.amount`, `.years`, `.premium` | Temporaire de chaque personne : montant, durée, prime mensuelle | ≥ 0 ; 1 à 40 |
| `bankPremium`                               | Prime mensuelle de la banque (pour les deux en couple)          | ≥ 0          |

`p2` est ignorée hors couple. Les valeurs hors bornes sont ramenées dans les bornes (`sanitize`).

## Le prêt

Au Canada, le taux d'un prêt hypothécaire à taux fixe est composé deux fois par année :

```
taux mensuel r = (1 + taux / 2)^(1/6) − 1
paiement       = montant × r / (1 − (1 + r)^−n),   n = années × 12
```

Un test vérifie le chiffre publié habituel : 639,81 $ par mois pour 100 000 $ à 6 % sur 25 ans. Le solde est suivi mois par mois ; on retient celui du **début de chaque année** (`rows[i].balance`), et il est nul à la fin.

## Protection année par année

| Option     | Pendant l'année _a_ du prêt                                   |
| ---------- | ------------------------------------------------------------- |
| Banque     | Le solde au début de l'année _a_                              |
| Temporaire | `amount` si _a_ ≤ `years`, sinon 0 ; une colonne par personne |

## Montants affichés

| Montant        | Calcul                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Prime par mois | La prime entrée ; en couple, les deux temporaires additionnées.                                                                       |
| Primes payées  | Prime × 12 × années payées **pendant le prêt** : `min(durée, prêt)` pour une temporaire, la durée du prêt pour la banque. Sans décès. |

`premiumGap` : primes de l'option la plus chère moins celles de l'autre, avec `cheaper` qui nomme la moins chère ; `null` si elles sont égales.

`fits` : pour chaque temporaire, l'année où elle cesse si elle finit avant le prêt (et le solde à ce moment), ou les années qu'elle dure après.

## Au décès (`deathAt`)

Pour l'année _a_ et la personne choisies (ramenées dans le prêt, et à `p1` hors couple) :

- **Banque** : verse le solde du début de l'année _a_, à la banque. Rien pour les proches. En couple, la protection s'arrête. `balanceShare` = ce solde ÷ le montant du prêt : la carte de la banque l'affiche pour l'année choisie, pour montrer la protection qui fond à prime égale.
- **Temporaire** : verse son montant (0 si elle est terminée). Si c'est assez, `free` = montant − solde, ce qui reste aux proches une fois le prêt payé ; sinon `shortfall` = solde − montant. En couple, `survivorCoverage` est la temporaire de l'autre personne, toujours en vigueur ou terminée.

## Explications

Chaque montant est un `Money` avec une phrase `formula.mortgage.*`. Un test vérifie que chaque phrase existe dans le catalogue et que chacun de ses `{paramètres}` est fourni, seul et en couple, avec une temporaire plus courte ou plus petite que le prêt.

## Limites

- Le taux reste le même jusqu'à la fin ; en réalité, il change souvent à chaque renouvellement.
- Le solde au décès est celui du début de l'année : un peu plus élevé que le vrai, à un an près.
- Les primes sont fixes, telles que soumises : c'est la règle générale selon l'ACFC. Les taux de la banque ne sont pas toujours garantis (la page méthode invite à le vérifier dans le certificat), et la banque peut revoir sa prime à un refinancement ; l'outil ne modélise ni l'un ni l'autre.
- Les primes payées supposent qu'aucun décès ne survient.
- Pas de paiements supplémentaires ni de remboursement anticipé.
- La portabilité et le bénéficiaire ne sont pas chiffrés ; la page les présente dans le tableau des différences.

## Page publique

`/hypotheque/methode` explique ce modèle au public, avec la source de chaque règle (composition semestrielle, assurance facultative, délai de 10 jours, assurance de la SCHL) et la date de sa dernière mise à jour (`mortgage.method.updated`). Elle se met à jour avec ce document. Les primes de départ (40 $, 70 $ en couple, 25 $ et 22 $ pour les temporaires) n'ont pas de source : aucune moyenne publique n'existe, et la page le dit.

La page montre aussi le calcul en notation mathématique (MathML), dans `src/app/hypotheque/method/mortgage-formula.html`, avec le sens de chaque symbole. Ces formules sont écrites à la main : **tout changement du calcul dans le moteur met à jour la formule MathML et ses symboles dans le même changement**, pour qu'il n'y ait jamais d'écart entre ce qui est affiché et ce qui est exécuté.

## Bornes des saisies

Le minimum et le maximum de chaque saisie sont dans [Limites des champs](limites-des-champs.md).
