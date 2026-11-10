/** Texts of the marginal tax rate tool (/impot). */
export const marginal = {
  'title.marginal': 'Taux marginal d’imposition',

  'marginal.title': 'Sur votre prochain dollar gagné, combien part en impôt ?',
  'marginal.lede':
    'Entrez votre revenu imposable. L’outil calcule votre taux marginal au fédéral et au Québec, votre impôt de l’année et ce qu’un revenu de plus vous laisse.',

  'marginal.form.heading': 'Votre revenu',
  'marginal.form.income': 'Revenu imposable',
  'marginal.form.incomeHelp':
    'Votre revenu de l’année, moins les déductions comme une cotisation REER. **Il figure à la ligne 26000 de votre déclaration fédérale, ou à la ligne 299 de celle du Québec.** Pour un salaire sans autre revenu, c’est à peu près le salaire brut.',
  'marginal.form.extra': 'Revenu de plus',
  'marginal.form.extraHelp':
    'Une augmentation, des heures supplémentaires ou un contrat. L’outil calcule l’impôt sur ce montant. Laissez vide pour ne pas l’ajouter.',
  'marginal.form.incomplete':
    'Il manque : {fields}. Les résultats gardent les derniers chiffres complets.',
  'marginal.missing.income': 'le revenu imposable',
  'marginal.reset.effect':
    'Le revenu et le revenu de plus reviennent aux chiffres de départ. Vos montants seront perdus.',

  'marginal.result.kicker': 'Votre résultat',
  'marginal.result.marginal': 'Taux marginal sur le prochain dollar',
  'marginal.result.federal': 'Fédéral, après l’abattement du Québec',
  'marginal.result.quebec': 'Québec',
  'marginal.result.year': 'Taux et seuils de l’année {year}.',
  'marginal.result.taxes': 'Votre impôt de l’année',
  'marginal.result.federalTax': 'Impôt fédéral',
  'marginal.result.quebecTax': 'Impôt du Québec',
  'marginal.result.total': 'Impôt total',
  'marginal.result.average': 'Taux moyen',
  'marginal.extra.title': 'Avec {amount} de plus',
  'marginal.extra.tax': 'Impôt de plus',
  'marginal.extra.kept': 'Ce qui vous reste',
  'marginal.extra.rate': 'Taux sur ce montant',

  'marginal.chart.title': 'Le taux marginal selon le revenu',
  'marginal.chart.sub':
    'Fédéral et Québec ensemble. Le trait plein marque votre revenu, le trait pointillé votre revenu avec le revenu de plus.',
  'marginal.chart.rate': 'Taux marginal',
  'marginal.chart.axis': 'Revenu imposable',
  'marginal.chart.from': 'À partir de {income}',
  'marginal.chart.beyond':
    'Le graphique s’arrête à {max}. Au-delà, le taux ne change plus : {percent}.',
  'marginal.chart.aria':
    'Graphique en escalier du taux marginal combiné selon le revenu imposable, de 0 à 300 000 $, avec un repère à votre revenu.',

  'marginal.table.heading': 'Les tranches, au fédéral et au Québec',
  'marginal.table.income': 'Revenu imposable',
  'marginal.table.federal': 'Fédéral',
  'marginal.table.quebec': 'Québec',
  'marginal.table.combined': 'Combiné',
  'marginal.table.range': 'De {from} à {to}',
  'marginal.table.over': 'Plus de {from}',

  'marginal.learn.kicker': 'Comprendre',
  'marginal.learn.heading': 'Précisions',
  'marginal.learn.raise.title': 'Une augmentation peut-elle faire baisser votre paie ?',
  'marginal.learn.raise.body':
    'Non. Quand votre revenu passe dans une tranche plus haute, seul le revenu au-dessus du seuil est imposé au nouveau taux. Le reste est imposé comme avant. C’est pourquoi votre taux moyen est toujours plus bas que votre taux marginal.',
  'marginal.learn.use.title': 'À quoi sert le taux marginal ?',
  'marginal.learn.use.body':
    'Il dit ce que vous garderiez d’un revenu de plus, et ce qu’une déduction vous ferait économiser. Une cotisation REER de 1 000 $ réduit votre revenu imposable d’autant : votre impôt baisse d’environ 1 000 $ × votre taux marginal, tant que la cotisation ne vous fait pas changer de tranche.',
  'marginal.learn.limits.title': 'Ce que l’outil ne compte pas',
  'marginal.learn.limits.body':
    'Les cotisations au RRQ, à l’assurance-emploi et au RQAP, et les crédits autres que le montant personnel de base. **Les prestations qui baissent quand le revenu monte ne sont pas comptées** : allocation famille, crédit pour la solidarité, allocation canadienne pour enfants. Pour une famille ou un revenu modeste, le taux réel peut être bien plus haut que celui affiché.',

  'title.marginalMethod': 'Détails et sources · Taux marginal',
  'marginal.method.updated': 'Dernière mise à jour : 1er novembre 2026',
  'marginal.method.principle.body':
    'L’outil calcule l’impôt fédéral et l’impôt du Québec sur le revenu entré, avec les taux et les seuils de 2026. Le taux marginal est celui du dollar qui suit ce revenu : ce que l’impôt prend sur un dollar de plus.',
  'marginal.method.principle.income':
    'Le revenu entré est traité comme un salaire ou une rente ordinaire. Les dividendes et les gains en capital ont leurs propres règles ; l’outil ne les calcule pas.',
  'marginal.method.principle.defaults':
    'Les chiffres de départ (70 000 $ de revenu imposable et 5 000 $ de plus) servent d’exemple. Remplacez-les par les vôtres.',
  'marginal.method.calc.quebec':
    'Au Québec, le revenu est imposé par tranches : 14 % jusqu’à 54 345 $, 19 % jusqu’à 108 680 $, 24 % jusqu’à 132 245 $ et 25,75 % au-delà. Le crédit pour le montant personnel de base, 14 % de 18 952 $, est ensuite retiré.',
  'marginal.method.calc.federal':
    'Au fédéral, les tranches sont de 14 % jusqu’à 58 523 $, 20,5 % jusqu’à 117 045 $, 26 % jusqu’à 181 440 $, 29 % jusqu’à 258 482 $ et 33 % au-delà. Le crédit pour le montant personnel de base vaut 14 % de 16 452 $.',
  'marginal.method.calc.phase':
    'Entre 181 440 $ et 258 482 $, le montant personnel fédéral baisse en ligne droite jusqu’à 14 829 $. Chaque dollar de plus dans cette zone réduit donc aussi le crédit, ce qui ajoute environ 0,25 % au taux marginal.',
  'marginal.method.calc.abatement':
    'Une personne qui habite au Québec retire 16,5 % de son impôt fédéral : c’est l’abattement du Québec, parce que le Québec finance lui-même certains programmes. Le taux fédéral affiché en tient compte.',
  'marginal.method.calc.zero':
    'Tant que le crédit pour le montant personnel efface l’impôt d’un palier, son taux marginal est de 0 %. C’est le cas jusqu’à 16 452 $ au fédéral et jusqu’à 18 952 $ au Québec.',
  'marginal.method.calc.formula': 'En symboles, l’outil fait ces calculs :',
  'marginal.method.symbol.m': 'le taux marginal combiné',
  'marginal.method.symbol.tf': 'le taux fédéral de la tranche du dollar suivant',
  'marginal.method.symbol.p':
    'ce que la baisse du montant personnel fédéral ajoute, entre 181 440 $ et 258 482 $',
  'marginal.method.symbol.a': 'l’abattement du Québec, 16,5 %',
  'marginal.method.symbol.tq': 'le taux du Québec de la tranche du dollar suivant',
  'marginal.method.symbol.R': 'le revenu imposable entré',
  'marginal.method.symbol.Tf': 'l’impôt fédéral calculé selon les tranches',
  'marginal.method.symbol.Tq': 'l’impôt du Québec calculé selon les tranches',
  'marginal.method.symbol.c': 'le taux des crédits, 14 % aux deux paliers',
  'marginal.method.symbol.Bf': 'le montant personnel de base fédéral',
  'marginal.method.symbol.Bq': 'le montant personnel de base du Québec',
  'marginal.method.symbol.If': 'l’impôt fédéral à payer',
  'marginal.method.symbol.Iq': 'l’impôt du Québec à payer',
  'marginal.method.calc.formulaZero':
    'Quand l’impôt d’un palier est nul, son taux dans la première formule est 0 %.',
  'marginal.method.calc.average': 'Le taux moyen est l’impôt total divisé par le revenu.',
  'marginal.method.calc.extra':
    'Pour un revenu de plus, l’outil calcule l’impôt total sur le revenu augmenté, puis retire l’impôt sur le revenu entré. Si le montant franchit un seuil, le taux sur ce montant se trouve entre deux taux marginaux.',
  'marginal.method.ref.quebec':
    'Les tranches et le montant personnel de base du Québec viennent des paramètres du régime d’imposition publiés par le ministère des Finances. Ils sont indexés chaque année, de 2,05 % pour 2026.',
  'marginal.method.source.quebec':
    'Ministère des Finances du Québec : paramètres du régime d’imposition des particuliers pour 2026.',
  'marginal.method.ref.federal':
    'Les tranches fédérales et l’abattement du Québec de 16,5 % sont ceux de l’Agence du revenu du Canada pour 2026.',
  'marginal.method.source.federal':
    'Agence du revenu du Canada : taux d’imposition et tranches de revenu pour 2026.',
  'marginal.method.ref.basic':
    'Le calcul du montant personnel fédéral réduit, entre 181 440 $ et 258 482 $, est celui de la feuille de travail TD1-WS.',
  'marginal.method.source.basic': 'Agence du revenu du Canada : feuille de travail TD1-WS 2026.',
  'marginal.method.ref.change':
    'Les taux et les seuils changent chaque année. Pour votre propre déclaration, fiez-vous à l’ARC et à Revenu Québec.',
  'marginal.method.limits.contributions':
    'Les cotisations au RRQ, à l’assurance-emploi, au RQAP et au Fonds des services de santé ne sont pas comptées.',
  'marginal.method.limits.credits':
    'Seuls les montants personnels de base sont crédités. Le montant canadien pour emploi, les frais médicaux, les dons et les autres crédits ne le sont pas.',
  'marginal.method.limits.benefits':
    'Les prestations qui baissent quand le revenu monte (allocation famille, crédit pour la solidarité, allocation canadienne pour enfants, prime au travail) ne sont pas comptées. Pour une famille ou un revenu modeste, elles peuvent faire monter le taux réel bien au-dessus de celui affiché.',
  'marginal.method.limits.income':
    'Le revenu net est supposé égal au revenu imposable pour la baisse du montant personnel fédéral.',
  'marginal.method.limits.amt': 'L’impôt minimum de remplacement n’est pas calculé.',
  'marginal.method.more.model': 'Le modèle de calcul du taux marginal, sur GitHub',

  'formula.marginal.federalRate':
    'Taux fédéral sur le dollar suivant = {bracketPercent} × (1 − {abatementPercent} d’abattement) = {federalPercent}.',
  'formula.marginal.federalRate.phase':
    'Taux fédéral sur le dollar suivant = ({bracketPercent} + {lossPercent} de crédit perdu) × (1 − {abatementPercent} d’abattement) = {federalPercent}.',
  'formula.marginal.federalRate.zero':
    'Le montant personnel de base fédéral ({basicAmount}) efface encore tout l’impôt sur {income} : taux fédéral sur le dollar suivant = {federalPercent}.',
  'formula.marginal.quebecRate':
    'Taux du Québec = taux de la tranche où tombe le dollar qui suit {income} = {quebecPercent}.',
  'formula.marginal.quebecRate.zero':
    'Le montant personnel de base du Québec ({basicAmount}) efface encore tout l’impôt sur {income} : taux du Québec sur le dollar suivant = {quebecPercent}.',
  'formula.marginal.marginal':
    'Taux marginal = {federalPercent} au fédéral + {quebecPercent} au Québec = {marginalPercent}.',
  'formula.marginal.federalTax':
    'Impôt fédéral = ({bracketTax} selon les tranches − {creditPercent} × {basicAmount} de montant personnel) × (1 − {abatementPercent} d’abattement) = {value}.',
  'formula.marginal.federalTax.zero':
    'Impôt fédéral : {bracketTax} selon les tranches, moins le crédit de {creditPercent} × {basicAmount}, ne laisse rien = {value}.',
  'formula.marginal.quebecTax':
    'Impôt du Québec = {bracketTax} selon les tranches − {creditPercent} × {basicAmount} de montant personnel = {value}.',
  'formula.marginal.quebecTax.zero':
    'Impôt du Québec : {bracketTax} selon les tranches, moins le crédit de {creditPercent} × {basicAmount}, ne laisse rien = {value}.',
  'formula.marginal.total':
    'Impôt total = {federalTax} au fédéral + {quebecTax} au Québec = {value}.',
  'formula.marginal.average': 'Taux moyen = {tax} d’impôt ÷ {income} de revenu = {averagePercent}.',
  'formula.marginal.average.zero': 'Sans revenu, aucun impôt : taux moyen = {averagePercent}.',
  'formula.marginal.extra.tax':
    'Impôt de plus = {taxAfter} sur {incomeAfter} − {taxBefore} sur {income} = {value}.',
  'formula.marginal.extra.kept': 'Ce qui vous reste = {amount} − {tax} d’impôt = {value}.',
  'formula.marginal.extra.rate': 'Taux sur ce montant = {tax} ÷ {amount} = {ratePercent}.',
};
