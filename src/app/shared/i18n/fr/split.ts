/** Texts of the expense split tool (/partage). */
export const split = {
  'title.split': 'Partage des dépenses',

  'split.person.p1': 'Personne 1',
  'split.person.p2': 'Personne 2',

  'split.title': 'Comment partager les dépenses à deux ?',
  'split.lede':
    'Entrez le salaire de chaque personne. L’outil calcule la part de chacune selon son revenu.',

  'split.form.heading': 'Vos revenus',
  'split.form.label': 'Prénom',
  'split.form.frequency': 'Fréquence de paie',
  'split.form.salary': 'Salaire',
  'split.form.salaryHelp':
    'Le montant de chaque paie, ou le salaire annuel. Brut ou net, **entrez le même type de salaire pour les deux personnes**.',
  'split.form.incomplete':
    'Il manque : {fields}. Les résultats gardent les derniers chiffres complets.',
  'split.missing.salary': 'le salaire de {name}',
  'split.form.bill': 'Une facture à partager',
  'split.form.billHelp': 'Le loyer, l’épicerie ou une autre dépense commune.',
  'split.reset.effect':
    'Les salaires et la facture reviennent aux chiffres de départ. Vos montants seront perdus.',

  'split.result.kicker': 'Votre partage',
  'split.result.ratio': 'Part de chacun',
  'split.result.five': 'Au 5 près : {p1} / {p2}.',
  'split.result.same':
    'Chaque personne consacre ainsi la même part de son revenu aux dépenses communes.',
  'split.result.annual': 'Revenu annuel',
  'split.result.combined': 'Revenu combiné',
  'split.result.bill': 'Sur une facture de {bill}',

  'split.basis.heading': 'Net ou brut ?',
  'split.basis.intro':
    'Les deux se font, mais **entrez le même type de salaire pour les deux personnes**. Sinon, le partage est faussé.',
  'split.basis.gross.title': 'Le salaire brut',
  'split.basis.gross.body':
    'Le salaire avant les retenues, celui du contrat de travail. Il est facile à trouver et ne bouge pas si vos retenues changent. Mais il ne tient pas compte de l’impôt.',
  'split.basis.net.title': 'Le salaire net',
  'split.basis.net.body':
    'Ce qui vous reste après l’impôt. Comme l’impôt grimpe avec le revenu, deux nets sont plus proches que deux bruts. Partager selon le net demande donc un peu moins à la personne qui gagne le plus.',
  'split.basis.which.title': 'Quel net entrer ?',
  'split.basis.which.body':
    'Partez du talon de paie : le salaire moins l’impôt, la RRQ, l’assurance emploi et le RQAP. Rajoutez les retenues volontaires, comme un REER collectif, des assurances facultatives ou des dons. Pour une cotisation obligatoire au régime de retraite, à vous de juger.',

  'split.learn.kicker': 'Comprendre',
  'split.learn.heading': 'Précisions',
  'split.learn.why.title': 'Pourquoi selon les revenus ?',
  'split.learn.why.body':
    'Moitié-moitié, la personne qui gagne moins consacre une plus grande part de son revenu aux dépenses communes. Selon les revenus, la part est la même pour les deux. Ce n’est qu’une façon de faire parmi d’autres.',
  'split.learn.frequency.title': 'Deux fois par mois ou aux deux semaines ?',
  'split.learn.frequency.body':
    'Deux fois par mois, c’est 24 paies par année ; aux deux semaines, 26. Pour un même montant de paie, 26 paies donnent un revenu annuel environ 8 % plus élevé. Vérifiez sur votre talon de paie.',
  'split.learn.other.title': 'Et les autres revenus ?',
  'split.learn.other.body':
    'Travail autonome, location, placements, allocations : ajoutez-les au salaire, à l’année. Pour un travail autonome, comptez le revenu après les dépenses d’entreprise.',

  'title.splitMethod': 'Détails et sources · Partage des dépenses',
  'split.method.updated': 'Dernière mise à jour : 27 octobre 2026',
  'split.method.principle.body':
    'L’outil calcule la part de chaque personne dans les dépenses communes, selon son revenu. La personne qui gagne 60 % du revenu combiné paie 60 % des dépenses. Chaque personne y consacre ainsi la même part de son revenu.',
  'split.method.principle.other':
    'C’est une façon de partager parmi d’autres. Moitié-moitié ou une autre entente peut aussi convenir à un couple ; l’outil montre seulement ce que donne le partage selon les revenus.',
  'split.method.principle.defaults':
    'Les salaires de départ, 75 000 $ et 55 000 $, sont des chiffres ronds qui montrent tout de suite un partage. Remplacez-les par les vôtres.',
  'split.method.calc.annual':
    'Chaque salaire est d’abord ramené à l’année, pour comparer deux personnes payées à des rythmes différents. La paie est multipliée par 12 au mois, par 24 deux fois par mois, par 26 aux deux semaines et par 52 à la semaine.',
  'split.method.calc.share':
    'La part d’une personne est son revenu annuel divisé par le revenu combiné des deux.',
  'split.method.calc.rounding':
    'Le partage est affiché à une décimale près, puis arrondi au point (les deux parts font toujours 100) et au 5 près, comme « 60 / 40 ».',
  'split.method.calc.bill':
    'Une facture entrée est partagée selon la part exacte, sans arrondi : facture × part.',
  'split.method.calc.zero':
    'Un revenu peut valoir 0 : l’autre personne paie alors tout. Deux revenus à 0 ne donnent pas de partage.',
  'split.method.ref.net':
    'Le salaire net est le salaire brut moins les retenues obligatoires : l’impôt du Québec et du fédéral, la cotisation au RRQ, l’assurance emploi et le RQAP. Le talon de paie les détaille.',
  'split.method.ref.progressive':
    'L’impôt est progressif : le taux monte par tranches de revenu. Au Québec en 2026, il passe de 14 % à 25,75 %, et le fédéral ajoute ses propres tranches. C’est pourquoi deux salaires nets sont plus proches que les deux salaires bruts.',
  'split.method.source.quebecRates':
    'Revenu Québec : les taux d’imposition du Québec, par tranche de revenu.',
  'split.method.limits.tax':
    'L’outil ne calcule aucun impôt. Il prend le salaire tel que vous l’entrez, brut ou net.',
  'split.method.limits.same':
    '**Un salaire brut et un salaire net, mélangés, faussent le partage.** Entrez le même type pour les deux personnes.',
  'split.method.limits.other':
    'Les autres revenus (travail autonome, location, placements, allocations) sont à ajouter vous-même au salaire.',
  'split.method.limits.one':
    'Une seule part s’applique à toutes les dépenses. Un couple qui partage le loyer d’une façon et l’épicerie d’une autre fait le calcul pour chacune.',
  'split.method.more.model': 'Le modèle de calcul du partage des dépenses, sur GitHub',

  'formula.split.annual.year': 'Salaire annuel = {value}.',
  'formula.split.annual': 'Salaire annuel = {amount} × {periods} paies = {value}.',
  'formula.split.combined': 'Revenu combiné = {leftValue} + {rightValue} = {value}.',
  'formula.split.bill':
    'Part des revenus = {income} ÷ {total} = {sharePercent}. Part de la facture = {bill} × {sharePercent} = {value}.',
};
