# VraiCoût

**Combien ça coûte, pour vrai ? VraiCoût le calcule avec vos chiffres, aujourd'hui et dans le temps.**

Des outils web gratuits et sans inscription, sur [vraicout.ca](https://vraicout.ca). Ils rendent visibles les coûts qui paraissent petits sur le moment, mais pèsent lourd quand on les additionne sur des années.

- **Partage des dépenses** (`/partage`) : la part de chaque personne dans les dépenses communes, selon son revenu.
- **Prix en heures de travail** (`/heures`) : un prix converti en heures de travail, selon la paie nette.
- **Dépenses fréquentes** (`/depenses`) : une dépense qui revient, ramenée à l'année, et son coût d'opportunité.
- **Taux marginal d'imposition** (`/impot`) : l'impôt sur le prochain dollar gagné au Québec.
- **Épargne dans le temps** (`/epargne`) : ce que les intérêts composés ajoutent, et ce que coûte de commencer plus tard.
- **Frais de gestion** (`/frais`) : ce que les frais d'un placement coûtent à la retraite.
- **Assurance vie** (`/assurance`) : une permanente, ou une temporaire et la différence de prime placée.
- **Assurance hypothécaire** (`/hypotheque`) : une temporaire personnelle ou l'assurance de la banque.

Chaque montant affiche, au clic ou au survol, le calcul exact qui l'a produit.

## Principes

- **Rien ne quitte le navigateur.** Pas de compte, pas de serveur : les chiffres restent dans le navigateur, sur l'appareil.
- **Éducatif, pas un conseil.** Les outils comparent des options selon les chiffres entrés et ne recommandent aucun produit.
- **Les formules affichées sont les formules exécutées.** L'explication de chaque montant est produite à partir des mêmes valeurs que le calcul.
- **Comparaison à égalité.** Quand un outil compare deux options, il leur donne le même budget, les mêmes dépôts et les mêmes années.

## Démarrer

Node.js 22.22.3 ou plus récent ; le projet utilise la version de `.nvmrc` (24).

```bash
nvm use
npm install
npm start                    # http://localhost:4200
npx ng test --watch=false    # tests Vitest, une seule passe (npm test reste en mode surveillance)
npm run build                # sortie statique dans dist/vraicout/browser
```

Sans clé PrimeUI, PrimeNG affiche un bandeau de licence : c'est normal en local. Voir [Déploiement](docs/deploiement.md).

Angular 22 entièrement statique (composants autonomes, signaux, sans zone), PrimeNG 22, Chart.js et Vitest.

## Documentation

- [Architecture](docs/architecture.md) : organisation du code, pages, état, composants, tests, et la marche à suivre pour ajouter un outil.
- [Déploiement](docs/deploiement.md) : clé PrimeUI, Cloudflare, indexation, fichiers écrits après le build.
- Modèles de calcul : [assurance vie](docs/modele-de-calcul.md), [frais de gestion](docs/modele-de-calcul-frais.md), [assurance hypothécaire](docs/modele-de-calcul-hypotheque.md), [partage des dépenses](docs/modele-de-calcul-partage.md), [prix en heures](docs/modele-de-calcul-heures.md), [dépenses fréquentes](docs/modele-de-calcul-depenses.md), [épargne dans le temps](docs/modele-de-calcul-epargne.md), [taux marginal](docs/modele-de-calcul-impot.md).
- [Règles de rédaction](docs/redaction.md) : ton, vocabulaire, catalogue de textes.
- [Chiffres annuels](docs/chiffres-annuels.md) : ce qui change chaque année, et chaque endroit où c'est écrit.
- [Limites des champs](docs/limites-des-champs.md) : le minimum et le maximum de chaque saisie.
- [Personas de test](docs/personas.md) : des personnes fictives pour éprouver chaque outil.

## Licence

Code source ouvert, sous licence AGPL.
