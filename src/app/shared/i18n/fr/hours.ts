/** Texts of the price in hours of work tool (/heures). */
export const hours = {
  'title.hours': 'Prix en heures de travail',

  'hours.title': 'Ça représente combien d’heures de travail ?',
  'hours.lede':
    'Entrez votre paie et un prix. L’outil calcule combien d’heures il faut travailler pour le payer.',

  'hours.form.heading': 'Votre paie',
  'hours.form.frequency': 'Fréquence de paie',
  'hours.form.salary': 'Paie nette',
  'hours.form.salaryHelp':
    'Ce qui arrive dans votre compte à chaque paie. **Vous le trouvez au bas de votre talon de paie.**',
  'hours.form.hoursPerWeek': 'Heures par semaine',
  'hours.form.hoursPerWeekHelp':
    'Les heures payées. Les vacances payées sont comprises dans la paie : l’année compte 52 semaines.',
  'hours.form.workCosts': 'Ce que le travail vous coûte par mois',
  'hours.form.workCostsHelp':
    'Transport, stationnement, garde des enfants, dîners au travail : ce que vous ne dépenseriez pas sans cet emploi.',
  'hours.form.purchase': 'L’achat',
  'hours.form.price': 'Prix',
  'hours.form.recurrence': 'Payé',
  'hours.form.addTax': 'Ajouter les taxes (TPS et TVQ)',
  'hours.form.addTaxHelp':
    'Les prix affichés en magasin sont avant taxes. Décochez si le prix entré les comprend déjà.',
  'hours.form.incomplete':
    'Il manque : {fields}. Les résultats gardent les derniers chiffres complets.',
  'hours.missing.salary': 'la paie nette',
  'hours.missing.hoursPerWeek': 'les heures par semaine',
  'hours.missing.price': 'le prix',
  'hours.missing.workCosts': 'des frais liés au travail plus petits que la paie',
  'hours.reset.effect':
    'La paie, les heures et le prix reviennent aux chiffres de départ. Vos montants seront perdus.',

  'hours.recurrence.once': 'une fois',
  'hours.recurrence.month': 'chaque mois',
  'hours.recurrence.year': 'chaque année',

  'hours.result.kicker': 'Votre résultat',
  'hours.result.once': 'Heures de travail pour payer cet achat',
  'hours.result.month': 'Heures de travail chaque mois',
  'hours.result.year': 'Heures de travail chaque année',
  'hours.result.hoursLine': 'Heures de travail',
  'hours.result.days': 'En journées de travail',
  'hours.result.perYear': 'Sur une année',
  'hours.result.price': 'Prix payé',
  'hours.result.annual': 'Paie nette par année',
  'hours.result.kept': 'Après ce que le travail coûte',
  'hours.result.hourly': 'Vous gagnez, à l’heure',
  'hours.result.hourlyKept': 'Ce qui vous reste, à l’heure',

  'hours.learn.kicker': 'Comprendre',
  'hours.learn.heading': 'Précisions',
  'hours.learn.net.title': 'Pourquoi la paie nette ?',
  'hours.learn.net.body':
    'Un achat se paie avec ce qui reste après l’impôt et les retenues, pas avec le salaire du contrat. Une heure de travail rapporte donc moins que le taux horaire affiché.',
  'hours.learn.costs.title': 'Pourquoi soustraire les frais du travail ?',
  'hours.learn.costs.body':
    'L’essence pour aller au bureau ou la garderie, vous les payez parce que vous travaillez. Ce qui vous reste pour une heure de travail est donc plus bas. Si vous n’entrez pas ces frais, l’achat demande un peu moins d’heures.',
  'hours.learn.limits.title': 'Ce que l’outil ne compte pas',
  'hours.learn.limits.body':
    'Les heures supplémentaires, les primes et le temps de transport. Le taux des taxes est celui du Québec (TPS 5 % et TVQ 9,975 %) ; certains achats en sont exemptés, comme l’épicerie de base.',

  'title.hoursMethod': 'Détails et sources · Prix en heures',
  'hours.method.updated': 'Dernière mise à jour : 27 octobre 2026',
  'hours.method.principle.body':
    'L’outil ramène votre paie à une heure de travail, puis divise le prix par ce montant. Le résultat dit combien d’heures il faut travailler pour payer l’achat.',
  'hours.method.principle.net':
    'Il part de la paie nette, ce qui arrive dans le compte, et retire ce que le travail vous coûte. Il ne calcule aucun impôt.',
  'hours.method.principle.defaults':
    'Les chiffres de départ (2 000 $ aux deux semaines, 37,5 heures par semaine, un achat de 1 400 $) servent d’exemple. Remplacez-les par les vôtres.',
  'hours.method.calc.annual':
    'La paie nette est ramenée à l’année : × 12 au mois, × 24 deux fois par mois, × 26 aux deux semaines, × 52 à la semaine.',
  'hours.method.calc.costs':
    'Les frais liés au travail, entrés par mois, sont multipliés par 12 et retirés de la paie annuelle. Des frais égaux ou plus élevés que la paie ne donnent pas de résultat.',
  'hours.method.calc.hourly':
    'Ce qui reste est divisé par les heures de l’année : les heures par semaine × 52 semaines.',
  'hours.method.calc.hours':
    'Le prix, avec les taxes si la case est cochée, divisé par ce montant à l’heure donne les heures de travail.',
  'hours.method.calc.days':
    'Une journée de travail compte le cinquième de vos heures par semaine : 7,5 heures pour 37,5 heures. Les heures divisées par ce nombre donnent les journées.',
  'hours.method.calc.recurrence':
    'Un prix payé chaque mois donne les heures par mois, puis × 12 pour l’année. Un prix payé chaque année donne directement les heures par année.',
  'hours.method.ref.tax':
    'Au Québec, la TPS de 5 % et la TVQ de 9,975 % se calculent toutes deux sur le prix avant taxes, soit 14,975 % en tout. L’outil multiplie donc le prix par 1,14975.',
  'hours.method.source.tax': 'Revenu Québec : le calcul de la TPS et de la TVQ.',
  'hours.method.ref.exempt':
    'Certains achats ne sont pas taxés, comme l’épicerie de base ou le loyer d’un logement. Pour ceux-là, décochez la case des taxes.',
  'hours.method.ref.weeks':
    'L’année compte 52 semaines : les vacances sont payées, donc comprises dans la paie annuelle.',
  'hours.method.limits.extra':
    'Les heures supplémentaires et les primes ne sont pas comptées, sauf si elles sont déjà dans la paie entrée.',
  'hours.method.limits.commute':
    'Le temps de transport n’est pas compté comme du temps de travail.',
  'hours.method.limits.tax':
    'Le taux de taxes est celui du Québec, le même pour tous les achats taxés.',
  'hours.method.limits.rounding': 'Les heures et les journées sont affichées à une décimale près.',
  'hours.method.more.model': 'Le modèle de calcul du prix en heures, sur GitHub',

  'formula.hours.annual.year': 'Paie nette par année = {value}.',
  'formula.hours.annual': 'Paie nette par année = {amount} × {periods} paies = {value}.',
  'formula.hours.kept': 'Après ce que le travail coûte = {amount} − {costs} × 12 mois = {value}.',
  'formula.hours.hourly':
    'Paie nette à l’heure = {amount} ÷ ({hoursPerWeek} h × {weeks} semaines) = {value}.',
  'formula.hours.hourly.kept':
    'Ce qui reste à l’heure = {amount} ÷ ({hoursPerWeek} h × {weeks} semaines) = {value}.',
  'formula.hours.price': 'Prix payé = {value}.',
  'formula.hours.price.tax': 'Prix avec les taxes = {amount} × (1 + {taxPercent}) = {value}.',
  'formula.hours.hours': 'Heures de travail = {price} ÷ {hourly} l’heure = {result} h.',
  'formula.hours.year': 'Sur une année = {hours} h × 12 mois = {result} h.',
  'formula.hours.days':
    'Une journée de travail = {hoursPerWeek} h ÷ {daysPerWeek} jours. Journées = {hours} h ÷ ({hoursPerWeek} h ÷ {daysPerWeek}) = {result} jours.',
};
