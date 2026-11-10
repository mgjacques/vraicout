/** Texts of the savings over time tool (/epargne). */
export const savings = {
  'title.savings': 'Épargne dans le temps',

  'savings.title': 'Combien vaudra votre épargne avec le temps ?',
  'savings.lede':
    'Entrez un dépôt mensuel, le nombre d’années et un rendement. L’outil montre ce que les intérêts ajoutent année après année, et ce que coûte le fait de commencer plus tard.',

  'savings.form.heading': 'Votre épargne',
  'savings.form.initial': 'Montant de départ',
  'savings.form.initialHelp':
    'Ce que vous placez dès aujourd’hui. Laissez vide si vous partez de zéro.',
  'savings.form.monthly': 'Dépôt mensuel',
  'savings.form.monthlyHelp': 'Le même montant chaque mois, déposé à la fin du mois.',
  'savings.form.depositYears': 'Années de dépôts',
  'savings.form.depositYearsHelp': 'Après ces années, vous ne déposez plus rien.',
  'savings.form.growthYears': 'Années sans dépôt, ensuite',
  'savings.form.growthYearsHelp':
    'Le placement continue de rapporter sans que vous y ajoutiez rien. Laissez vide pour arrêter le calcul à la fin des dépôts.',
  'savings.form.return': 'Rendement annuel espéré',
  'savings.form.returnHelp':
    'Ce que le placement rapporte par année, en moyenne, une fois les frais payés : à 6 %, 100 $ deviennent 106 $ en un an. **Aucun rendement n’est garanti.**',
  'savings.form.late': 'Commencer plus tard',
  'savings.form.delay': 'Années d’attente',
  'savings.form.delayHelp':
    'Le même dépôt, commencé plus tard et arrêté au même moment. Laissez vide pour ne pas comparer.',
  'savings.form.real': 'Dollars d’aujourd’hui',
  'savings.form.incomplete':
    'Il manque : {fields}. Les résultats gardent les derniers chiffres complets.',
  'savings.missing.amount': 'un montant de départ ou un dépôt mensuel',
  'savings.missing.depositYears': 'les années de dépôts',
  'savings.missing.return': 'le rendement',
  'savings.missing.delay': 'une attente plus courte que les années de dépôts',
  'savings.reset.effect':
    'Les montants, les années et le rendement reviennent aux chiffres de départ. Vos chiffres seront perdus.',

  'savings.result.kicker': 'Votre résultat',
  'savings.result.final': 'Solde après {years} ans',
  'savings.result.deposited': 'Total versé',
  'savings.result.interest': 'Intérêts gagnés',
  'savings.result.share': 'Part du solde qui vient des intérêts',
  'savings.result.depositEnd': 'Solde à la fin des dépôts',
  'savings.result.real': 'Montants en dollars d’aujourd’hui.',
  'savings.late.title': 'En commençant {delay} ans plus tard',
  'savings.late.missed': 'Dépôts que vous ne faites pas',
  'savings.late.cost': 'Ce que coûte l’attente',

  'savings.chart.title': 'Votre solde, année après année',
  'savings.chart.sub': 'Ce que vous avez versé, et ce que les intérêts y ajoutent.',
  'savings.chart.deposited': 'Versé',
  'savings.chart.interest': 'Intérêts',
  'savings.chart.late': 'Commencé {delay} ans plus tard',
  'savings.chart.axis': 'Années',
  'savings.chart.year': 'Année {year}',
  'savings.chart.aria':
    'Graphique du solde par année : ce que vous avez versé et ce que les intérêts y ajoutent.',

  'savings.learn.kicker': 'Comprendre',
  'savings.learn.heading': 'Précisions',
  'savings.learn.compound.title': 'Pourquoi le solde accélère ?',
  'savings.learn.compound.body':
    'Les intérêts s’ajoutent au solde, puis rapportent à leur tour. À 6 % par année, un montant double en 12 ans environ, puis double encore dans les 12 ans suivants. Les dernières années ajoutent donc le plus, même sans nouveau dépôt.',
  'savings.learn.early.title': 'Pourquoi commencer tôt compte autant ?',
  'savings.learn.early.body':
    'Les premiers dépôts sont ceux qui ont le plus d’années pour rapporter. En commençant plus tard, ce sont eux que vous perdez. Le solde baisse donc beaucoup plus que la somme des dépôts manqués.',
  'savings.learn.limits.title': 'Ce que l’outil ne compte pas',
  'savings.learn.limits.body':
    'Le rendement est le même chaque année, alors qu’un vrai placement monte et descend. L’outil ne retire ni impôt ni frais de gestion, et le dépôt mensuel ne suit pas l’inflation.',

  'title.savingsMethod': 'Détails et sources · Épargne dans le temps',
  'savings.method.updated': 'Dernière mise à jour : 29 octobre 2026',
  'savings.method.principle.body':
    'L’outil fait croître un placement mois par mois à un rendement fixe. Il refait ensuite le même calcul pour le même dépôt commencé plus tard, et montre la part du solde qui vient des intérêts.',
  'savings.method.principle.defaults':
    'Les chiffres de départ servent d’exemple : 100 $ par mois pendant 20 ans, puis 25 ans sans dépôt, à 6 % par année, et le même dépôt commencé 10 ans plus tard. Remplacez-les par les vôtres.',
  'savings.method.calc.rate':
    'Le rendement entré est annuel : à 6 %, 100 $ deviennent exactement 106 $ en un an. L’outil le convertit en taux mensuel qui donne le même résultat sur douze mois : (1 + 6 %) à la puissance 1/12, moins 1, soit environ 0,487 % par mois.',
  'savings.method.calc.month':
    'Chaque mois, le solde rapporte d’abord ses intérêts, puis le dépôt du mois s’ajoute. Le montant de départ est placé dès le premier jour.',
  'savings.method.calc.growth':
    'Après la dernière année de dépôts, le solde continue de croître au même rendement, sans rien ajouter.',
  'savings.method.calc.formula': 'En symboles, l’outil fait ces trois calculs, dans l’ordre :',
  'savings.method.symbol.r': 'le rendement annuel entré',
  'savings.method.symbol.i': 'le taux mensuel qui en découle',
  'savings.method.symbol.P': 'le montant de départ',
  'savings.method.symbol.D': 'le dépôt mensuel',
  'savings.method.symbol.m': 'le nombre de mois de dépôts, moins élevé pour le départ retardé',
  'savings.method.symbol.a': 'le nombre d’années sans dépôt, après la fin des dépôts',
  'savings.method.symbol.S': 'le solde à la fin des dépôts',
  'savings.method.symbol.F': 'le solde final',
  'savings.method.calc.formulaZero':
    'À un rendement de 0 %, la fraction ne se calcule pas. Elle vaut alors m, et le solde est tout ce qui a été versé.',
  'savings.method.calc.late':
    'Le départ retardé dépose le même montant chaque mois à partir de l’année choisie, et arrête en même temps. Il verse donc moins. La différence entre les deux soldes est ce que coûte l’attente.',
  'savings.method.calc.interest':
    'Les intérêts gagnés sont le solde final moins tout ce qui a été versé.',
  'savings.method.calc.real':
    'En dollars d’aujourd’hui, chaque solde est ramené à aujourd’hui selon l’inflation choisie, et chaque dépôt depuis le mois où il est fait.',
  'savings.method.ref.return':
    'L’Institut de planification financière et FP Canada publient chaque année des normes pour les projections. Pour 2026, elles prévoient de 6,3 % à 6,6 % par an pour les actions et 3,2 % pour les obligations, avant frais. Retirez vos frais de ces chiffres pour estimer votre rendement.',
  'savings.method.limits.return':
    'Le rendement est le même chaque année. Un vrai placement monte et descend, et l’ordre des bonnes et des mauvaises années change le résultat.',
  'savings.method.limits.costs':
    'Aucun impôt ni frais de gestion n’est retiré. Entrez un rendement après frais.',
  'savings.method.limits.deposit': 'Le dépôt mensuel reste le même, sans suivre l’inflation.',
  'savings.method.more.model': 'Le modèle de calcul de l’épargne dans le temps, sur GitHub',

  'formula.savings.deposited': 'Total versé = {depositMonthly} × {months} mois = {value}.',
  'formula.savings.deposited.initial':
    'Total versé = {initial} + {depositMonthly} × {months} mois = {value}.',
  'formula.savings.deposited.initialOnly': 'Total versé = le montant de départ, {value}.',
  'formula.savings.saved':
    'Après {years} ans de dépôts : {depositMonthly} par mois pendant {months} mois, chaque dépôt placé à {ratePercent} par année jusqu’à la fin des dépôts = {value}.',
  'formula.savings.saved.initial':
    'Après {years} ans de dépôts : {initial} × (1 + {ratePercent})^{years}, plus {depositMonthly} par mois pendant {months} mois, chaque dépôt placé à {ratePercent} par année jusqu’à la fin des dépôts = {value}.',
  'formula.savings.saved.initialOnly':
    'Après {years} ans : {initial} × (1 + {ratePercent})^{years} = {value}.',
  'formula.savings.final':
    'Puis {years} ans sans dépôt : {balance} × (1 + {ratePercent})^{years} = {value}.',
  'formula.savings.interest': 'Intérêts gagnés = solde {balance} − versé {deposited} = {value}.',
  'formula.savings.share': 'Part des intérêts = {amount} ÷ {balance} = {sharePercent}.',
  'formula.savings.missed':
    'Versé en commençant tout de suite {leftValue} − en commençant plus tard {rightValue} = {value}.',
  'formula.savings.cost':
    'Solde en commençant tout de suite {leftValue} − en commençant plus tard {rightValue} = {value}.',
  'formula.savings.real.flow':
    'En dollars d’aujourd’hui : chaque montant ramené du mois où il est versé, avec une inflation de {inflationPercent} par an = {value} (au lieu de {nominal}).',
};
