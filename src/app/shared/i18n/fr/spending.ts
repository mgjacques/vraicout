/** Texts of the frequent spending tool (/depenses). */
export const spending = {
  'title.spending': 'Dépenses fréquentes',

  'spending.title': 'Une dépense fréquente, ça coûte combien par année ?',
  'spending.lede':
    'Entrez une dépense qui revient souvent et sa fréquence. L’outil calcule ce qu’elle coûte par année, sur plusieurs années, et ce que les mêmes sommes vaudraient si elles étaient placées.',

  'spending.form.heading': 'Votre dépense',
  'spending.form.amount': 'Montant payé chaque fois',
  'spending.form.amountHelp':
    'Le prix tel que vous le payez, taxes et pourboire compris : un café, un dîner, un abonnement.',
  'spending.form.count': 'Valeur de X',
  'spending.form.cadence': 'Fréquence',
  'spending.form.timesPerYear': 'Soit {times} fois par année.',
  'spending.form.years': 'Nombre d’années',
  'spending.form.yearsHelp': 'Sur combien d’années projeter la dépense.',
  'spending.form.invest': 'Si vous placiez plutôt cet argent',
  'spending.form.return': 'Rendement annuel espéré',
  'spending.form.returnHelp':
    'Ce que le placement rapporterait par année, en moyenne, une fois les frais payés : à 7 %, 100 $ deviennent 107 $ en un an. **Aucun rendement n’est garanti.**',
  'spending.form.priceGrowth': 'Suivre l’inflation',
  'spending.form.priceGrowthHelp':
    'Le prix augmente au début de chaque nouvelle année, au rythme de l’inflation. Décochée, la case garde le même prix toutes les années.',
  'spending.form.incomplete':
    'Il manque : {fields}. Les résultats gardent les derniers chiffres complets.',
  'spending.missing.amount': 'le montant',
  'spending.missing.count': 'la valeur de X',
  'spending.missing.years': 'le nombre d’années',
  'spending.missing.return': 'le rendement',
  'spending.reset.effect':
    'Le montant, la fréquence, les années et le rendement reviennent aux chiffres de départ. Vos chiffres seront perdus.',

  'spending.cadence.perDay': 'X fois par jour',
  'spending.cadence.everyDays': 'Aux X jours',
  'spending.cadence.perWeek': 'X fois par semaine',
  'spending.cadence.everyWeeks': 'Aux X semaines',
  'spending.cadence.perMonth': 'X fois par mois',
  'spending.cadence.everyMonths': 'Aux X mois',

  'spending.result.kicker': 'Votre résultat',
  'spending.result.perYear': 'Coût par année',
  'spending.result.perYearGrowth': 'Coût la première année',
  'spending.result.total': 'Sur {years} ans',
  'spending.result.opportunity': 'Coût d’opportunité',
  'spending.result.opportunityHelp':
    'Ce que les mêmes sommes vaudraient après {years} ans, placées chaque mois à {rate} par année.',
  'spending.result.interest': 'Intérêts gagnés',

  'spending.learn.kicker': 'Comprendre',
  'spending.learn.heading': 'Précisions',
  'spending.learn.opportunity.title': 'Qu’est-ce que le coût d’opportunité ?',
  'spending.learn.opportunity.body':
    'C’est ce à quoi vous renoncez en dépensant. Chaque dollar dépensé n’est plus là pour rapporter des intérêts. L’outil montre ce que ces dollars vaudraient s’ils avaient été placés au lieu d’être dépensés.',
  'spending.learn.limits.title': 'Ce que l’outil ne compte pas',
  'spending.learn.limits.body':
    'L’impôt sur les intérêts, qui dépend du compte où l’argent est placé, et les années où le placement baisse. Les montants ne sont pas ramenés en dollars d’aujourd’hui.',

  'title.spendingMethod': 'Détails et sources · Dépenses fréquentes',
  'spending.method.updated': 'Dernière mise à jour : 9 novembre 2026',
  'spending.method.principle.body':
    'L’outil ramène une dépense qui revient souvent à l’année, puis la multiplie par le nombre d’années. Il calcule ensuite ce que les mêmes sommes vaudraient si elles avaient été placées chaque mois.',
  'spending.method.principle.paid':
    'Le montant entré est celui qui est payé. L’outil n’ajoute ni taxes ni impôt.',
  'spending.method.principle.defaults':
    'Les chiffres de départ (un café de 5 $, 5 fois par semaine, pendant 10 ans, placé à 7 %) servent d’exemple. Remplacez-les par les vôtres.',
  'spending.method.calc.times':
    'L’année compte 365 jours, 52 semaines et 12 mois. « 3 fois par semaine » donne 3 × 52 = 156 fois par année ; « aux 3 semaines » donne 52 ÷ 3 = 17,33 fois.',
  'spending.method.calc.perYear':
    'Le coût par année est le montant multiplié par ce nombre de fois.',
  'spending.method.calc.total':
    'Sans hausse des prix, le coût sur plusieurs années est le coût par année multiplié par le nombre d’années. Avec la hausse, chaque année coûte l’inflation de plus que la précédente, et les années sont additionnées.',
  'spending.method.calc.invested':
    'Pour le coût d’opportunité, le douzième du coût de l’année est déposé à la fin de chaque mois. Le rendement annuel est converti en taux mensuel équivalent : 7 % par année donnent 0,565 % par mois. Chaque mois, le solde gagne ses intérêts, puis reçoit le dépôt.',
  'spending.method.calc.interest': 'Les intérêts sont la valeur placée moins ce qui a été dépensé.',
  'spending.method.ref.return':
    'L’Institut de planification financière et FP Canada publient chaque année des normes pour les projections. Pour 2026, elles prévoient de 6,3 % à 6,6 % par an pour les actions, avant frais. Le 7 % de départ est un exemple, pas une prévision.',
  'spending.method.limits.return':
    'Le rendement est le même chaque année. Un vrai placement monte et descend, et rien n’est garanti.',
  'spending.method.limits.tax':
    'Aucun impôt ni frais n’est retiré du placement. Dans un CELI, il n’y aurait pas d’impôt ; ailleurs, il y en aurait.',
  'spending.method.limits.growth':
    'La hausse des prix est la même chaque année et s’applique d’un coup au début de l’année.',
  'spending.method.limits.real': 'Les montants ne sont pas ramenés en dollars d’aujourd’hui.',
  'spending.method.limits.calendar':
    '52 semaines et 365 jours ne tombent pas pile : « 1 fois par jour » donne 365 fois, « 7 fois par semaine » en donne 364.',
  'spending.method.more.model': 'Le modèle de calcul des dépenses fréquentes, sur GitHub',

  'formula.spending.perYear.perDay':
    'Coût par année = {amount} × {count} fois par jour × {periods} jours = {value}.',
  'formula.spending.perYear.everyDays':
    'Coût par année = {amount} × ({periods} jours ÷ {count}) = {value}.',
  'formula.spending.perYear.perWeek':
    'Coût par année = {amount} × {count} fois par semaine × {periods} semaines = {value}.',
  'formula.spending.perYear.everyWeeks':
    'Coût par année = {amount} × ({periods} semaines ÷ {count}) = {value}.',
  'formula.spending.perYear.perMonth':
    'Coût par année = {amount} × {count} fois par mois × {periods} mois = {value}.',
  'formula.spending.perYear.everyMonths':
    'Coût par année = {amount} × ({periods} mois ÷ {count}) = {value}.',
  'formula.spending.total': 'Coût sur {years} ans = {amount} × {years} ans = {value}.',
  'formula.spending.total.growth':
    'Coût sur {years} ans, le prix montant de {inflationPercent} par année = {amount} × ((1 + {inflationPercent})^{years} − 1) ÷ {inflationPercent} = {value}.',
  'formula.spending.invested':
    'Valeur placée = {depositMonthly} déposés à la fin de chaque mois pendant {months} mois, placés à {ratePercent} par année = {value}.',
  'formula.spending.invested.growth':
    'Valeur placée = {depositMonthly} déposés à la fin de chaque mois la première année, {inflationPercent} de plus chaque année suivante, pendant {months} mois, placés à {ratePercent} par année = {value}.',
  'formula.spending.interest':
    'Intérêts = valeur placée {balance} − dépensé {deposited} = {value}.',
};
