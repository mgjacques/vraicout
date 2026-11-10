# Personas de test

Des personnes fictives qui pourraient utiliser VraiCoût, avec des chiffres à entrer dans chaque outil. Elles servent à éprouver les outils sur des situations réalistes et à repérer ce qui casse, ce qui étonne ou ce qui est mal expliqué.

Les primes, taux et salaires sont des ordres de grandeur plausibles pour le Québec en 2026, pas des soumissions réelles. Les taux marginaux (fédéral et Québec combinés) sont ceux que donne l'outil `/impot` avec les chiffres de 2026, arrondis à l'unité ; ce sont aussi les taux entrés dans l'assurance et les frais. Ils changent avec les tranches d'impôt : voir [Chiffres annuels](chiffres-annuels.md).

Chaque persona a une section « Ce que ça éprouve » : c'est la raison pour laquelle elle existe.

## Charger un persona dans l'app

En développement (`npm start`), ajoutez `?persona=<id>` à n'importe quelle adresse, par exemple <http://localhost:4200/assurance/comparaison?persona=lucie>. Tous les outils repartent comme à une première visite, puis prennent les chiffres du persona ; ceux qu'il utilise s'ouvrent sur leurs résultats. Le paramètre disparaît ensuite de l'adresse.

Identifiants : `camille`, `karim-sophie`, `marie-eve`, `jean-francois`, `lucie`, `thomas`, `nadia-elise`, `robert`, `alex`.

Les chiffres sont dans `src/app/dev/personas.ts` : un changement ici se fait aussi là. Un test vérifie que chaque persona remplit ses formulaires au complet (sauf Alex, incomplet exprès). Le build de production remplace le chargeur par une version vide : les personas ne sont jamais publiés.

---

## 1. Camille, 28 ans — le cas typique

Infirmière à Montréal, célibataire, locataire. Une représentante lui a proposé une assurance vie entière « qui prend de la valeur ». Elle veut savoir si ça vaut mieux qu'une temporaire et placer la différence.

- Salaire : 72 000 $ brut par an, payé aux deux semaines (net d'environ 1 900 $ par paie). Taux marginal : 36 % (36,12 %).
- Épargne actuelle : 200 $ par mois dans un fonds commun de sa banque.

**Assurance**
| Champ | Valeur |
|---|---|
| Âge / horizon | 28 / défaut |
| Permanente | 95 $/mois, capital 100 000 $, valeur de rachat 0 $, primes payables 20 ans, croissance projetée 2 % |
| Tableau des valeurs | 48 ans : garantie 14 000 $, projetée 24 000 $ · 65 ans : 38 000 $ / 72 000 $ |
| Temporaire | 22 $/mois, capital 250 000 $, 20 ans |
| Paramètres | rendement 6,5 %, 100 % réinvesti, CELI, inflation 2 % |

**Frais** : 0 $ au départ, 200 $/mois, 37 ans, rendement 6 %. A : fonds de banque, RFG 2,1 %, sans conseiller. B : FNB, RFG 0,25 %. CELI.

**Heures** : net 1 900 $ aux deux semaines, 37,5 h, frais de travail 120 $/mois (stationnement). Prix : paiement d'auto 450 $/mois.

**Dépenses** : un café à 4,75 $, 5 fois par semaine, sur 10 ans, rendement 7 %, prix fixes.

**Impôt** : revenu imposable 72 000 $, revenu de plus 3 000 $ (des heures supplémentaires).

**Ce que ça éprouve** : le parcours le plus fréquent, proche de l'exemple de chaque outil, et un montant avec des cents dans les dépenses. Si les résultats ou les textes sont confus ici, ils le seront pour tout le monde.

---

## 2. Karim et Sophie, 34 et 33 ans — premier achat en couple

Ils achètent un condo à Laval. La banque leur offre son assurance prêt ; un ami courtier leur parle de temporaires. Ils veulent aussi un partage des dépenses juste.

- Karim : 88 000 $ brut par an. Sophie : 61 000 $ brut par an.

**Hypothèque**
| Champ | Valeur |
|---|---|
| Prêt | 420 000 $, 25 ans, 4,49 % |
| Couple | oui |
| Assurance de la banque | 78 $/mois pour les deux |
| Karim | temporaire 450 000 $, 25 ans, 32 $/mois |
| Sophie | temporaire 450 000 $, 25 ans, 28 $/mois |

**Partage** : Karim 88 000 $/an, Sophie 61 000 $/an (brut). Facture : 2 350 $ (hypothèque, taxes, électricité).

**Assurance** (Karim, qui a reçu une proposition à part) : 34 ans, permanente 210 $/mois, capital 250 000 $, primes payables 20 ans, valeur de rachat 0 $. Temporaire 30 ans, 500 000 $, 35 $/mois. REER, taux 36 % maintenant (36,12 % à 88 000 $) et 26 % à la retraite.

**Ce que ça éprouve** : le mode couple de l'hypothèque, une temporaire qui finit pile avec le prêt, un partage autour de 59/41, et le REER avec deux taux différents.

---

## 3. Marie-Ève, 41 ans — une police qu'elle paie déjà

Technicienne administrative à Sherbrooke, monoparentale, deux enfants. Elle a pris une vie entière il y a dix ans et se demande si elle devrait la garder ou passer à une temporaire avec plus de couverture pour ses enfants. Elle sait qu'elle ne placera pas toute la différence.

- Salaire : 52 000 $ brut par an, payé deux fois par mois (net d'environ 1 650 $). Taux marginal : 26 % (25,69 %).

**Assurance**
| Champ | Valeur |
|---|---|
| Âge / horizon | 41 / 85 |
| Permanente | 65 $/mois, capital 50 000 $, valeur de rachat 6 200 $, primes payables 10 ans (payée à 51 ans), croissance 1,5 % |
| Tableau des valeurs | 41 : 6 200 $ / 6 800 $ · 51 : 14 500 $ / 18 000 $ · 65 : 21 000 $ / 31 000 $ |
| Temporaire | 38 $/mois, capital 300 000 $, 20 ans |
| Paramètres | rendement 5 %, **50 % réinvesti**, CELI, épargne en plus 0 $ |

**Hypothèque** (renouvellement, seule) : solde 185 000 $, 17 ans restants, 5,1 %. Banque : 41 $/mois. Temporaire 200 000 $, 20 ans, 24 $/mois.

**Heures** : net 1 650 $ deux fois par mois, 35 h, frais de travail 450 $/mois (garderie et autobus). Prix : lunettes 389 $ avant taxes.

**Dépenses** : la coiffure, 65 $ aux 6 semaines, sur 15 ans, rendement 7 %.

**Épargne** : 100 $/mois pour les études des enfants, pendant 17 ans, rendement 5 %. Ni croissance après, ni départ retardé.

**Ce que ça éprouve** : une valeur de rachat déjà là, des primes qui s'arrêtent avant la temporaire (le côté « garder » se met à placer la différence), une part réinvestie sous 100 %, une temporaire qui dure plus longtemps que le prêt, des frais de travail qui pèsent lourd dans le taux horaire, une fréquence « aux X semaines » qui ne tombe pas juste (8,67 fois par année), et une épargne sans croissance ni comparaison.

---

## 4. Jean-François, 52 ans — gros contrat, prime annuelle

Entrepreneur à Québec, revenu élevé. Il paie depuis 12 ans une vie entière d'un million qu'un planificateur lui a vendue comme outil fiscal. Il se demande ce qu'il aurait s'il l'abandonnait aujourd'hui pour une temporaire.

- Revenu : 160 000 $ par an. Taux marginal : 47 % aujourd'hui (47,46 %), 36 % à la retraite.

**Assurance**
| Champ | Valeur |
|---|---|
| Âge / horizon | 52 / 95 |
| Permanente | **17 000 $/an**, capital 1 000 000 $, valeur de rachat 140 000 $, primes payables 8 ans, croissance 2,5 % |
| Tableau des valeurs | 60 : 260 000 $ / 330 000 $ · 75 : 480 000 $ / 690 000 $ · 90 : 720 000 $ / 1 200 000 $ |
| Temporaire | 2 600 $/an, capital 1 000 000 $, 20 ans |
| Paramètres | rendement 6,5 %, 100 %, **REER**, 47 % / 36 %, dollars d'aujourd'hui, inflation 2,5 % |

**Frais** : 450 000 $ au départ, 2 500 $/mois, 13 ans, rendement 6 %. A : RFG 0,8 % + conseiller 1 %. B : FNB 0,2 %. Non enregistré, 47 % / 36 %. Décaissement sur 25 ans.

**Impôt** : revenu imposable 160 000 $, revenu de plus 40 000 $ (un contrat de plus).

**Ce que ça éprouve** : la périodicité annuelle, des montants dans les centaines de milliers, le REER à deux taux, les dollars d'aujourd'hui, le compte non enregistré, le décaissement, et un revenu de plus qui franchit le seuil de 181 440 $ où le montant personnel fédéral commence à baisser.

---

## 5. Lucie, 63 ans — police libérée, garder ou encaisser ?

Retraitée à Trois-Rivières. Sa vie entière est payée depuis longtemps. Son neveu lui dit d'encaisser la valeur de rachat et de prendre une petite temporaire pour les funérailles.

- Revenu de retraite : 42 000 $ par an. Taux marginal : 26 % (25,69 %).

**Assurance**
| Champ | Valeur |
|---|---|
| Âge / horizon | 63 / 95 |
| Permanente | **0 $**, capital 75 000 $, valeur de rachat 48 000 $, **primes payables 0 an**, croissance 1 % |
| Tableau des valeurs | 63 : 48 000 $ / 51 000 $ · 80 : 59 000 $ / 66 000 $ · 95 : 72 000 $ / 78 000 $ |
| Temporaire | 190 $/mois, capital 100 000 $, **10 ans** |
| Paramètres | rendement 4 %, 100 %, CELI, inflation 2 % |

**Frais** : 320 000 $ au départ, 0 $/mois, **1 an**, rendement 4,5 %. A : RFG 1,9 %. B : RFG 0,4 %. CELI. Décaissement sur 30 ans.

**Ce que ça éprouve** : la permanente qui ne coûte plus rien alors que la temporaire coûte cher (c'est le côté « garder » qui place toute la différence), une temporaire courte qui finit à 73 ans, un horizon long, et le décaissement sans épargne avant.

---

## 6. Thomas, 23 ans — premier emploi, petit budget

Premier emploi dans un entrepôt à Gatineau, payé à la semaine. Un représentant rencontré à un souper de famille lui a proposé une vie entière « pour bloquer son assurabilité ». Il vit avec sa blonde Léa et veut aussi savoir combien d'heures lui coûte un téléphone.

- Salaire : 22 $/h, 40 h/semaine (net d'environ 690 $ par semaine). Taux marginal : 26 % (25,69 %). Léa : 24 000 $ par an.

**Assurance**
| Champ | Valeur |
|---|---|
| Âge / horizon | 23 / défaut |
| Permanente | 45 $/mois, capital 50 000 $, valeur de rachat 0 $, primes payables jusqu'à 100 ans (77 ans) |
| Tableau des valeurs | non rempli |
| Temporaire | 19 $/mois, capital 250 000 $, **30 ans** |
| Paramètres | rendement 6,5 %, 100 %, CELI |

**Heures** : net 690 $ par semaine, 40 h, frais 0 $. Prix : téléphone 1 449 $ avant taxes ; puis forfait 65 $/mois.

**Partage** : Thomas 690 $/semaine, Léa 24 000 $/an (fréquences différentes). Épicerie : 900 $.

**Dépenses** : un repas livré à 32 $, 2 fois par semaine, sur 10 ans, rendement 7 %, prix qui suivent l'inflation (2 %).

**Épargne** : 50 $/mois pendant 10 ans, puis 32 ans sans dépôt (jusqu'à 65 ans), rendement 6 %, comparé au même placement commencé 5 ans plus tard, en dollars d'aujourd'hui.

**Ce que ça éprouve** : un horizon très long, une temporaire de 30 ans, des primes à vie sans tableau de valeurs, la paie hebdomadaire, deux fréquences de paie dans le partage, la taxe ajoutée, des prix qui montent avec l'inflation, et le coût d'attendre sur un petit montant avec beaucoup de temps devant.

---

## 7. Nadia et Élise, 45 et 47 ans — revenus très inégaux

Couple à Montréal avec une maison chère. Nadia est médecin, Élise travaille à temps partiel. Leur conseiller propose à Nadia une vie entière participante « comme placement ».

- Nadia : 210 000 $ par an, taux marginal 50 % (50,21 %). Élise : 35 000 $ par an.

**Partage** : Nadia 210 000 $/an, Élise 35 000 $/an. Facture : 4 800 $.

**Hypothèque**
| Champ | Valeur |
|---|---|
| Prêt | 650 000 $, 22 ans restants, 4,2 % |
| Couple | oui |
| Assurance de la banque | 165 $/mois |
| Nadia | temporaire 700 000 $, 20 ans, 85 $/mois |
| Élise | temporaire 300 000 $, **15 ans**, 48 $/mois |

**Assurance** (Nadia) : 45 ans, permanente 900 $/mois, capital 500 000 $, primes payables 15 ans, valeur de rachat 0 $, croissance 3 %. Temporaire 20 ans, 750 000 $, 70 $/mois. Non enregistré, taux 50 %, dollars d'aujourd'hui.

**Impôt** (Nadia) : revenu imposable 210 000 $, revenu de plus laissé vide.

**Ce que ça éprouve** : un partage autour de 86/14, un taux marginal dans la zone où le montant personnel fédéral baisse, un revenu de plus vide, des temporaires qui finissent avant le prêt (trou de couverture et solde restant), des capitaux inégaux en couple, le compte non enregistré à taux élevé, et la croissance projetée la plus optimiste.

---

## 8. Robert, 71 ans — aux limites de l'âge

Veuf à Rimouski. Il paie encore une vie entière prise à 40 ans, à vie. Il veut savoir si continuer à payer a encore du sens à son âge.

- Revenu de retraite : 38 000 $ par an. Taux marginal : 26 % (25,69 %).

**Assurance**
| Champ | Valeur |
|---|---|
| Âge / horizon | 71 / **110** |
| Permanente | 310 $/mois, capital 200 000 $, valeur de rachat 92 000 $, primes payables 29 ans |
| Tableau des valeurs | 71 : 92 000 $ / 105 000 $ · 85 : 140 000 $ / 165 000 $ · 100 : 200 000 $ / 200 000 $ |
| Temporaire | 420 $/mois, capital 100 000 $, 10 ans |
| Paramètres | rendement 3,2 %, 100 %, CELI |

**Impôt** : revenu imposable 38 000 $, revenu de plus 20 000 $ (un retrait de son FERR).

**Épargne** : la valeur de rachat de 92 000 $ placée d'un coup, sans dépôt mensuel, 1 an de dépôts puis 14 ans de croissance, rendement 3,2 %.

**Ce que ça éprouve** : un revenu de plus qui franchit le seuil de 54 345 $ du Québec, un montant de départ seul dans l'épargne, un âge élevé, l'horizon maximal, une temporaire plus chère que la permanente, une valeur de rachat qui rejoint le capital, et un jalon de 65 ans déjà passé.

---

## 9. Alex, 36 ans — pressé, entre le minimum

Alex a reçu une soumission par courriel et veut une réponse rapide. Alex ne connaît ni sa valeur de rachat ni le tableau du contrat, et laisse les paramètres par défaut.

**Assurance** : 36 ans, horizon vide. Permanente 140 $/mois, capital 150 000 $, le reste vide. Temporaire 30 $/mois, 400 000 $, 20 ans.

**Heures** : salaire annuel 58 000 $, rien d'autre ; puis un prix de 0 $.

**Impôt** : revenu imposable 58 000 $, revenu de plus laissé vide.

**Ce que ça éprouve** : les valeurs par défaut, les champs laissés vides, l'absence de tableau des valeurs, et ce que l'interface dit (ou ne dit pas) quand il manque une donnée.

---

## Couverture

| Persona | Assurance | Frais | Hypothèque | Partage | Heures | Dépenses | Épargne | Impôt |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1. Camille | ✓ | ✓ | | | ✓ | ✓ | | ✓ |
| 2. Karim et Sophie | ✓ | | ✓ couple | ✓ | | | | |
| 3. Marie-Ève | ✓ | | ✓ seule | | ✓ | ✓ | ✓ | |
| 4. Jean-François | ✓ | ✓ | | | | | | ✓ |
| 5. Lucie | ✓ | ✓ | | | | | | |
| 6. Thomas | ✓ | | | ✓ | ✓ | ✓ | ✓ | |
| 7. Nadia et Élise | ✓ | | ✓ couple | ✓ | | | | ✓ |
| 8. Robert | ✓ | | | | | | ✓ | ✓ |
| 9. Alex | ✓ | | | | ✓ | | | ✓ |

Cas particuliers de l'assurance couverts : prime annuelle (4), permanente libérée (5), valeur de rachat existante (3, 4, 5, 8), part réinvestie sous 100 % (3), REER (2, 4), non enregistré (4, 7), dollars d'aujourd'hui (4, 7), temporaires de 10, 20, 25 et 30 ans, temporaire plus chère que la permanente (5, 8), aucun tableau de valeurs (6, 9).

Cas particuliers des autres outils : dépenses avec des cents (1), « aux X semaines » (3), prix qui suivent l'inflation (6) ; épargne sans croissance ni comparaison (3), départ retardé en dollars d'aujourd'hui (6), montant de départ seul (8) ; impôt dans chaque palier, avec un revenu de plus qui franchit un seuil du Québec (8) ou le début de la baisse du montant personnel fédéral (4), dans cette zone (7) et sans revenu de plus (7, 9).
