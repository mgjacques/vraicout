/** Texts shared by every tool: warning, amounts, tax and today's dollars. */
export const common = {
  'app.footer': 'Vos chiffres restent sur votre appareil. Vous pouvez les effacer depuis le menu.',
  'footer.contact': 'Une question ou un commentaire ? Écrivez à :',
  'warning.title': 'Ce n’est pas un conseil',
  'warning.body':
    'L’outil ne recommande aucun produit et ne remplace pas un conseil financier. Les résultats dépendent seulement des chiffres que vous entrez.',
  'warning.investing.body':
    'L’outil ne recommande aucun fonds ni aucune firme. Les résultats dépendent seulement des chiffres que vous entrez, et personne ne connaît les rendements futurs.',
  'figure.formula': 'Voir le calcul',
  'formula.tax.tfsa':
    'Placé dans un CELI : aucun impôt, ni sur la croissance ni au retrait. En main = {value}.',
  'formula.tax.taxable':
    'Placé hors CELI et REER : si vous retiriez tout à ce moment, la moitié du gain de {gain} serait imposée à {ratePercent}, soit {tax} d’impôt. En main = {beforeTax} − {tax} = {value}.',
  'formula.tax.rrsp':
    'Placé dans un REER : chaque versement donne un remboursement d’impôt de {ratePercent}, replacé dans le REER ({deposited} de votre poche, {contributed} avec les remboursements). Si vous retiriez tout à ce moment, l’impôt à {laterPercent} serait de {tax}. En main = {beforeTax} − {tax} = {value}.',
  'formula.real.value':
    'En dollars d’aujourd’hui : {nominal} ramenés de {years} ans avec une inflation de {inflationPercent} par an = {value}.',
  'sidebar.collapse': 'Masquer les paramètres',
  'sidebar.expand': 'Afficher les paramètres',
  'drawer.open': 'Paramètres',
  'drawer.title': 'Vos paramètres',
  'drawer.close': 'Fermer les paramètres',
  'profile.progress': 'Étape {step} sur {total}',
  'profile.next': 'Suivant',
  'profile.back': 'Précédent',
  'profile.missing': 'Il manque : {fields}.',
  'welcome.private':
    'Aucune inscription. Rien de ce que vous entrez n’est collecté : vos chiffres restent sur votre appareil.',
  'field.required': ' (obligatoire)',
  'field.max': 'Maximum : {value}. Le calcul utilise ce nombre.',
  'field.min': 'Minimum : {value}. Le calcul utilise ce nombre.',
  'results.stale':
    'Ces résultats viennent des derniers chiffres complets. Ils se mettront à jour quand les champs manquants seront remplis.',
  'reset.label': 'Repartir de zéro',
  'reset.title': 'Repartir de zéro ?',
  'reset.cancel': 'Annuler',
  'print.label': 'Imprimer ou enregistrer en PDF',
  'print.dialog.title': 'Imprimer',
  'print.dialog.help': 'Cochez ce que vous voulez sur papier ou dans le PDF.',
  'print.dialog.always': 'La mise en garde et la note de bas de page sont toujours incluses.',
  'print.dialog.all': 'Tout cocher',
  'print.dialog.none': 'Tout décocher',
  'print.dialog.cancel': 'Annuler',
  'print.dialog.confirm': 'Imprimer',
  'print.section.params': 'Vos paramètres',
  'print.params.title': 'Vos paramètres',
  'print.params.yes': 'Oui',
  'print.params.no': 'Non',
  'print.params.anchor': 'Valeurs de rachat à {age} ans',
  'print.params.anchorValues': 'garantie {guaranteed} · totale {projected}',
  'unit.years': ' ans',
  'unit.yearPrefix': 'Année ',
  'unit.percent': ' %',
  'unit.hours': ' h',
  'unit.day': ' jour',
  'unit.days': ' jours',

  'pay.freq.year': 'à l’année',
  'pay.freq.month': 'au mois (12 paies)',
  'pay.freq.semimonth': 'deux fois par mois (24 paies)',
  'pay.freq.biweekly': 'aux deux semaines (26 paies)',
  'pay.freq.week': 'à la semaine (52 paies)',

  'drawer.account.tfsa': 'Dans un CELI',
  'drawer.account.rrsp': 'Dans un REER',
  'drawer.account.taxable': 'Dans un compte ordinaire (non enregistré)',
  'drawer.accountHelp.tfsa':
    'Aucun impôt, ni sur la croissance ni au retrait. Vos droits de cotisation au CELI sont limités chaque année ; l’outil ne vérifie pas ce plafond.',
  'drawer.accountHelp.rrsp':
    'Chaque versement vous donne un remboursement d’impôt, que l’outil suppose replacé dans le REER. Les retraits sont imposés. Vos droits de cotisation sont limités ; l’outil ne vérifie pas ce plafond.',
  'drawer.accountHelp.taxable':
    'Pas de plafond, mais les gains sont imposables. L’outil les traite comme des gains en capital : la moitié du gain est imposée au retrait. Si vos placements rapportent surtout des intérêts, l’impôt réel est plus élevé.',
  'drawer.taxRate': 'Votre taux d’imposition marginal',
  'drawer.taxRateHelp':
    'Le pourcentage d’impôt sur chaque dollar de plus que vous gagnez. Au Québec, il va d’environ 26 % à 53 % selon votre revenu.',
  'drawer.taxRateLater': 'Votre taux d’imposition au moment des retraits',
  'drawer.taxRateLaterHelp':
    'Souvent plus bas à la retraite, si vos revenus baissent. Gardez le même taux si vous ne savez pas.',
  'drawer.realDollars': 'Afficher en dollars d’aujourd’hui',
  'drawer.realDollarsHelp':
    'Un dollar dans 30 ans achètera moins qu’aujourd’hui. Cette option ramène tous les montants en dollars d’aujourd’hui, selon l’inflation choisie.',
  'drawer.inflation': 'Inflation annuelle',
  'drawer.inflationHelp': 'La Banque du Canada vise une inflation de 2 % par an.',
  'chip.account.tfsa': 'Placements dans un CELI',
  'chip.account.rrsp': 'Placements dans un REER',
  'chip.account.taxable': 'Placements non enregistrés, impôt à {rate}',
  'chip.real': 'En dollars d’aujourd’hui (inflation {rate} par an)',
  'chip.nominal': 'Montants non ajustés pour l’inflation',
  'method.title': 'Détails et sources',
  'method.link': 'Détails et sources de cet outil',
  'toolLinks.label': 'Pages de cet outil',
  'contents.label': 'Sur cette page',
  'contents.result': 'Le résultat',
  'contents.chart': 'Le graphique',
  'breadcrumb.label': 'Fil d’Ariane',
  'breadcrumb.intro': 'Avant de commencer',
  'title.notFound': 'Page introuvable',
  'notFound.title': 'Cette page n’existe pas',
  'notFound.body':
    'L’adresse est peut-être mal écrite, ou la page a changé de place. Les outils sont tous sur l’accueil.',
  'notFound.home': 'Retour à l’accueil',
  'toolLinks.intro': 'Revoir l’introduction',
  'welcome.backToResults': 'Revenir à ma comparaison',
  'method.index.lede':
    'Le détail du calcul de chaque outil, la source de ses repères et ses limites.',
  'method.index.authorities.title': 'Les organismes publics cités',
  'method.index.authorities.body':
    'La plupart des sources des outils viennent de ces organismes. Leurs sites expliquent les règles en vigueur et vos droits.',
  'method.index.authorities.amf': 'Autorité des marchés financiers (AMF)',
  'method.index.authorities.fcac':
    'Agence de la consommation en matière financière du Canada (ACFC)',
  'method.index.authorities.cra': 'Agence du revenu du Canada (ARC)',
  'method.index.authorities.revenuQuebec': 'Revenu Québec',
  'method.index.authorities.bankOfCanada': 'Banque du Canada',
  'method.index.authorities.cmhc': 'Société canadienne d’hypothèques et de logement (SCHL)',
  'method.source': 'Source :',
  'method.back': 'Retour à l’outil',
  'method.lede': 'Le détail du calcul, la source de chaque repère et les limites de l’outil.',
  'method.principle.title': 'Principe',
  'method.calc.title': 'Calcul',
  'method.ref.title': 'Repères et sources',
  'method.ref.inflation': 'L’inflation suggérée, 2 % par an, est la cible de la Banque du Canada.',
  'method.source.norms':
    'Institut de planification financière et FP Canada, Normes d’hypothèses de projection.',
  'method.source.rrsp':
    'Agence du revenu du Canada, guide T4040 : REER et autres régimes enregistrés pour la retraite.',
  'method.source.tfsa': 'Agence du revenu du Canada : qu’est-ce qu’un CELI.',
  'method.source.capitalGains':
    'Agence du revenu du Canada : calculer et déclarer vos gains et pertes en capital.',
  'method.limits.title': 'Limites',
  'method.limits.ceilings': 'Les plafonds de cotisation au CELI et au REER ne sont pas vérifiés.',
  'method.more.title': 'Pour aller plus loin',
  'method.more.body':
    'Le modèle de calcul complet, avec chaque formule, est publié avec le code source du site.',
  'sources.inflation': 'Banque du Canada : la cible d’inflation de 2 %.',
};
