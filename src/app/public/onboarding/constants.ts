export const ONBOARDING_STEPS = [
  { n: 1, code: "001", title: "Questionnaire", short: "Connaissance client" },
  { n: 2, code: "002", title: "Carton de signature", short: "Signature" },
  { n: 3, code: "003", title: "Demande d’ouverture", short: "Ouverture" },
  { n: 4, code: "004", title: "Convention d’ouverture", short: "Convention" },
  { n: 5, code: "005", title: "Gestion sous mandat", short: "Mandat" },
  { n: 6, code: "006", title: "Préférence de communication", short: "Communication" },
] as const;

export const CIVILITES = [
  { value: "M", label: "M." },
  { value: "MME", label: "Mme" },
  { value: "MLLE", label: "Mlle" },
];

export const PIECES = [
  { value: "CNI", label: "CNI" },
  { value: "EXTRAIT", label: "Extrait" },
  { value: "PASSEPORT", label: "Passeport" },
];

export const STATUTS_MATRIMONIAUX = [
  { value: "CELIBATAIRE", label: "Célibataire" },
  { value: "MARIE", label: "Marié(e)" },
  { value: "VEUF", label: "Veuf / Veuve" },
  { value: "AUTRE", label: "Autre (à préciser)" },
];

export const CLASSIFICATIONS = [
  { value: "CADRE_DIRIGEANT", label: "Cadre dirigeant" },
  { value: "EMPLOYE_CADRE", label: "Employé(e) / Cadre" },
  { value: "PROFESSION_LIBERALE", label: "Profession libérale / indépendant" },
  { value: "COMMERCANT", label: "Commerçant, artisan, exploitant agricole" },
  { value: "RETRAITE", label: "Retraité(e)" },
  { value: "ETUDIANT", label: "Étudiant(e)" },
  { value: "SANS_PROFESSION", label: "Sans profession" },
  { value: "AUTRES", label: "Autres (à préciser)" },
];

export const DECES = [
  { value: "PERSONNE", label: "À M. / Mme désigné(e)" },
  { value: "SUCCESSION", label: "À la succession" },
];

export const REVENUS = [
  { value: "LT_500K", label: "Moins de 500 000 FCFA" },
  { value: "500K_1M", label: "Entre 500 001 et 1 000 000 FCFA" },
  { value: "1M_1_5M", label: "Entre 1 000 001 et 1 500 000 FCFA" },
  { value: "1_5M_3M", label: "Entre 1 500 001 et 3 000 000 FCFA" },
  { value: "3M_6M", label: "Entre 3 000 001 et 6 000 000 FCFA" },
  { value: "6M_9M", label: "Entre 6 000 001 et 9 000 000 FCFA" },
  { value: "9M_10M", label: "Entre 9 000 001 et 10 000 000 FCFA" },
  { value: "GT_10M", label: "Au-delà de 10 000 000 FCFA" },
];

export const MONTANTS = [
  { value: "LT_1M", label: "Moins de 1 000 000 FCFA" },
  { value: "1M_3M", label: "Entre 1 000 001 et 3 000 000 FCFA" },
  { value: "3M_5M", label: "Entre 3 000 001 et 5 000 000 FCFA" },
  { value: "5M_10M", label: "Entre 5 000 001 et 10 000 000 FCFA" },
  { value: "10M_20M", label: "Entre 10 000 001 et 20 000 000 FCFA" },
  { value: "20M_50M", label: "Entre 20 000 001 et 50 000 000 FCFA" },
  { value: "GT_50M", label: "Au-delà de 50 000 000 FCFA" },
];

export const PROVENANCES = [
  { value: "SALAIRE", label: "Revenus salariaux" },
  { value: "EPARGNE", label: "Épargne / Contrat d’assurance" },
  { value: "FONCIER", label: "Revenu foncier / Location" },
  { value: "PENSION", label: "Pension / Retraite" },
  { value: "VENTE", label: "Vente de biens ou d’actifs" },
  { value: "INVESTISSEMENTS", label: "Produits d’investissements" },
  { value: "COMMERCE", label: "Activités commerciales" },
  { value: "DONATION", label: "Donation / héritage" },
  { value: "JEUX", label: "Gains aux jeux" },
  { value: "PRETS", label: "Prêts" },
  { value: "AUTRE", label: "Autre (à préciser)" },
];

export const OBJECTIFS = [
  { value: "SECURISER", label: "Sécuriser le capital" },
  { value: "CROISSANCE", label: "Croissance du capital à long terme" },
  { value: "REVENUS", label: "Avoir un flux de revenus stable périodiquement" },
];

export const CANAUX = [
  { value: "EMAIL", label: "Email" },
  { value: "TELEPHONE", label: "Téléphone" },
];

export const COMPREHENSIONS = [
  { value: "AUCUN", label: "Aucun" },
  { value: "FAIBLE", label: "Faible" },
  { value: "MOYEN", label: "Moyen" },
  { value: "BON", label: "Bon" },
  { value: "EXCELLENT", label: "Excellent" },
];

export const SITUATIONS = [
  {
    value: "INSTABLE",
    label: "Instable",
    hint: "Mes dépenses sont plus élevées que mes revenus et je dois soit puiser régulièrement dans mes économies ou emprunter de l’argent à des tiers.",
  },
  {
    value: "PLUTOT_INSTABLE",
    label: "Plutôt instable",
    hint: "Mes revenus sont plus élevés que mes dépenses, mais il m’arrive souvent de devoir puiser dans mes économies ou d’emprunter de l’argent à des tiers.",
  },
  {
    value: "BONNE",
    label: "Bonne",
    hint: "Mes revenus sont plus élevés que mes dépenses et de façon exceptionnelle, je pourrais puiser dans mes économies.",
  },
  {
    value: "EXCELLENTE",
    label: "Excellente",
    hint: "Mes revenus sont plus élevés que mes dépenses et je n’ai pas à puiser dans mes économies.",
  },
];

export const EPARGNES = [
  { value: "LT_500K", label: "Moins de 500 000 FCFA" },
  { value: "500K_2M", label: "Entre 500 001 FCFA et 2 000 000 FCFA" },
  { value: "2M_5M", label: "Entre 2 000 001 FCFA et 5 000 000 FCFA" },
  { value: "GT_5M", label: "Plus de 5 000 000 FCFA" },
];

export const HORIZONS = [
  { value: "LT_1A", label: "Moins de 1 an" },
  { value: "1A", label: "1 an" },
  { value: "3A", label: "Environ 3 ans" },
  { value: "5A", label: "Environ 5 ans" },
  { value: "10A", label: "Environ 10 ans" },
  { value: "15A", label: "15 ans" },
  { value: "20A", label: "20 ans" },
  { value: "25A", label: "25 ans et plus" },
];

export const FREQUENCES = [
  { value: "MENSUEL", label: "Tous les mois" },
  { value: "TRIMESTRIEL", label: "Tous les 3 mois" },
  { value: "SEMESTRIEL", label: "Tous les 6 mois" },
  { value: "ANNUEL", label: "Tous les ans" },
];

export const PLACEMENTS = [
  { value: "AUCUN", label: "Aucun" },
  { value: "GARANTIS", label: "Placements garantis tels que les dépôts à terme" },
  { value: "OBLIGATIONS", label: "Obligations et bons du Trésor" },
  { value: "ACTIONS", label: "Actions ou fonds commun de placement" },
  { value: "AUTRE", label: "Autre (à préciser)" },
];

export const TOLERANCES = [
  {
    value: "FAIBLE",
    label: "Faible",
    hint: "Votre objectif est de préserver votre placement plutôt que d’obtenir des rendements élevés.",
  },
  {
    value: "MOYEN",
    label: "Moyen",
    hint: "Vous acceptez un certain degré de risque et de volatilité afin de pouvoir obtenir des rendements élevés à long terme.",
  },
  {
    value: "ELEVE",
    label: "Élevé",
    hint: "Vous acceptez un degré de risque et de volatilité raisonnable afin de pouvoir obtenir des rendements plus élevés à long terme.",
  },
  {
    value: "TRES_ELEVE",
    label: "Très élevé",
    hint: "Vous acceptez un degré de risque et de volatilité très élevé afin de pouvoir obtenir des rendements plus élevés à long terme.",
  },
];

export const BAISSES = [
  { value: "AUCUNE", label: "Aucune baisse" },
  { value: "JUSQUA_5", label: "Jusqu’à 5%" },
  { value: "6_15", label: "Entre 6% et 15%" },
  { value: "PLUS_15", label: "Plus de 15%" },
];

export const DOCUMENT_KINDS = [
  {
    kind: "PIECE_IDENTITE" as const,
    title: "Pièce d’identité",
    hint: "CNI, passeport ou extrait du titulaire du compte.",
  },
  {
    kind: "PREUVE_ADRESSE" as const,
    title: "Preuve d’adresse",
    hint: "Facture nominative de moins de 3 mois, certificat de domicile ou contrat de location.",
  },
  {
    kind: "PHOTO_IDENTITE" as const,
    title: "Photo d’identité",
    hint: "Photo ou selfie au format JPG, PNG ou WEBP (pas de PDF).",
  },
];
