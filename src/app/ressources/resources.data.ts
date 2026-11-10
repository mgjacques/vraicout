import { MessageKey } from '../shared/i18n/fr';

export interface Resource {
  readonly title: MessageKey;
  readonly by?: MessageKey;
  readonly about: MessageKey;
  /** Checked at the source: never an affiliate link or a shop. */
  readonly url: string;
  readonly lang: 'fr' | 'en';
}

export interface ResourceSection {
  /** The anchor in the page's address. */
  readonly id: string;
  readonly title: MessageKey;
  /** The section's title does not already give the language, so each English entry says so. */
  readonly mixedLanguages?: boolean;
  readonly entries: readonly Resource[];
}

export const RESOURCE_SECTIONS: readonly ResourceSection[] = [
  {
    id: 'livres-francais',
    title: 'resources.section.booksFr',
    entries: [
      {
        title: 'resources.zeroMillionaire.title',
        by: 'resources.zeroMillionaire.by',
        about: 'resources.zeroMillionaire.about',
        url: 'https://editionslapresse.ca/products/de-zero-a-millionnaire',
        lang: 'fr',
      },
      {
        title: 'resources.reallyNeed.title',
        by: 'resources.reallyNeed.by',
        about: 'resources.reallyNeed.about',
        url: 'https://saint-jeanediteur.com/titre/en-tu-vraiment-besoin-2/',
        lang: 'fr',
      },
      {
        title: 'resources.loveBill.title',
        by: 'resources.loveBill.by',
        about: 'resources.loveBill.about',
        url: 'https://saint-jeanediteur.com/titre/la-facture-amoureuse/',
        lang: 'fr',
      },
      {
        title: 'resources.settled.title',
        by: 'resources.settled.by',
        about: 'resources.settled.about',
        url: 'https://saint-jeanediteur.com/titre/as-tu-regle-ca-2e-edition/',
        lang: 'fr',
      },
      {
        title: 'resources.millionaires.title',
        by: 'resources.millionaires.by',
        about: 'resources.millionaires.about',
        url: 'https://editionslapresse.ca/products/les-millionnaires-ne-sont-pas-ceux-que-vous-croyez',
        lang: 'fr',
      },
      {
        title: 'resources.liberty45.title',
        by: 'resources.liberty45.by',
        about: 'resources.liberty45.about',
        url: 'https://saint-jeanediteur.com/titre/liberte-45/',
        lang: 'fr',
      },
    ],
  },
  {
    id: 'sites',
    title: 'resources.section.sites',
    mixedLanguages: true,
    entries: [
      {
        title: 'resources.couchPotato.title',
        by: 'resources.couchPotato.by',
        about: 'resources.couchPotato.about',
        url: 'https://canadiancouchpotato.com/',
        lang: 'en',
      },
      {
        title: 'resources.laPresse.title',
        by: 'resources.laPresse.by',
        about: 'resources.laPresse.about',
        url: 'https://www.lapresse.ca/affaires/finances-personnelles/',
        lang: 'fr',
      },
      {
        title: 'resources.portfolioManager.title',
        by: 'resources.portfolioManager.by',
        about: 'resources.portfolioManager.about',
        url: 'https://canadianportfoliomanagerblog.com/',
        lang: 'en',
      },
      {
        title: 'resources.finiki.title',
        about: 'resources.finiki.about',
        url: 'https://www.finiki.org/wiki/Main_Page',
        lang: 'en',
      },
    ],
  },
  {
    id: 'balados-francais',
    title: 'resources.section.podcastsFr',
    entries: [
      {
        title: 'resources.fifteenMinutes.title',
        by: 'resources.fifteenMinutes.by',
        about: 'resources.fifteenMinutes.about',
        url: 'https://www.lapresse.ca/affaires/balado-15-minutes-pour-devenir-millionnaire/',
        lang: 'fr',
      },
      {
        title: 'resources.questionInterest.title',
        by: 'resources.questionInterest.by',
        about: 'resources.questionInterest.about',
        url: 'https://ici.radio-canada.ca/ohdio/balados/6942/gerald-fillion-finance-economie-analyse',
        lang: 'fr',
      },
      {
        title: 'resources.retirementPodcast.title',
        by: 'resources.retirementPodcast.by',
        about: 'resources.retirementPodcast.about',
        url: 'https://www.retraitequebec.gouv.qc.ca/fr/balado',
        lang: 'fr',
      },
    ],
  },
  {
    id: 'balados-anglais',
    title: 'resources.section.podcastsEn',
    entries: [
      {
        title: 'resources.benFelix.title',
        by: 'resources.benFelix.by',
        about: 'resources.benFelix.about',
        url: 'https://www.youtube.com/@BenFelixCSI',
        lang: 'en',
      },
      {
        title: 'resources.couchPotatoPodcast.title',
        by: 'resources.couchPotatoPodcast.by',
        about: 'resources.couchPotatoPodcast.about',
        url: 'https://canadiancouchpotato.com/podcast/',
        lang: 'en',
      },
    ],
  },
  {
    id: 'outils',
    title: 'resources.section.tools',
    entries: [
      {
        title: 'resources.simulR.title',
        by: 'resources.simulR.by',
        about: 'resources.simulR.about',
        url: 'https://simulr.svc.retraitequebec.gouv.qc.ca/',
        lang: 'fr',
      },
      {
        title: 'resources.simulRetraite.title',
        by: 'resources.simulRetraite.by',
        about: 'resources.simulRetraite.about',
        url: 'https://www.retraitequebec.gouv.qc.ca/fr/services-ligne-et-outils/simulretraite-outil-simulation-revenus-retraite',
        lang: 'fr',
      },
      {
        title: 'resources.cmhc.title',
        by: 'resources.cmhc.by',
        about: 'resources.cmhc.about',
        url: 'https://www.cmhc-schl.gc.ca/consommateurs/acheter-une-maison/calculateurs-pour-lachat-dune-habitation',
        lang: 'fr',
      },
    ],
  },
  {
    id: 'organismes',
    title: 'resources.section.bodies',
    entries: [
      {
        title: 'resources.amf.title',
        about: 'resources.amf.about',
        url: 'https://lautorite.qc.ca/grand-public',
        lang: 'fr',
      },
      {
        title: 'resources.retraiteQuebec.title',
        about: 'resources.retraiteQuebec.about',
        url: 'https://www.retraitequebec.gouv.qc.ca/fr',
        lang: 'fr',
      },
      {
        title: 'resources.revenuQuebec.title',
        about: 'resources.revenuQuebec.about',
        url: 'https://www.revenuquebec.ca/fr/',
        lang: 'fr',
      },
      {
        title: 'resources.cra.title',
        about: 'resources.cra.about',
        url: 'https://www.canada.ca/fr/agence-revenu.html',
        lang: 'fr',
      },
      {
        title: 'resources.epq.title',
        about: 'resources.epq.about',
        url: 'https://epq.gouv.qc.ca/decouvrez-nous/tout-sur-epargne-placements-quebec/comptes-offert/celiapp/faq/',
        lang: 'fr',
      },
      {
        title: 'resources.acef.title',
        about: 'resources.acef.about',
        url: 'https://defensedesconsommateurs.org/nos-membres/',
        lang: 'fr',
      },
      {
        title: 'resources.optionConsumers.title',
        about: 'resources.optionConsumers.about',
        url: 'https://option-consommateurs.org/',
        lang: 'fr',
      },
      {
        title: 'resources.opc.title',
        about: 'resources.opc.about',
        url: 'https://www.opc.gouv.qc.ca/',
        lang: 'fr',
      },
      {
        title: 'resources.educaloi.title',
        about: 'resources.educaloi.about',
        url: 'https://educaloi.qc.ca/',
        lang: 'fr',
      },
    ],
  },
  {
    id: 'communautes',
    title: 'resources.section.communities',
    mixedLanguages: true,
    entries: [
      {
        title: 'resources.quebecFinance.title',
        about: 'resources.quebecFinance.about',
        url: 'https://www.reddit.com/r/QuebecFinance/',
        lang: 'fr',
      },
      {
        title: 'resources.personalFinanceCanada.title',
        about: 'resources.personalFinanceCanada.about',
        url: 'https://www.reddit.com/r/PersonalFinanceCanada/',
        lang: 'en',
      },
    ],
  },
];
