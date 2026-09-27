export type DocumentKind =
  | "PIECE_IDENTITE"
  | "PREUVE_ADRESSE"
  | "PHOTO_IDENTITE"
  | "QUESTIONNAIRE_EXPORTE"
  | "SIGNATURE_SPECIMEN"
  | "CARTON_SIGNATURE_EXPORTE"
  | "DEMANDE_OUVERTURE_EXPORTE"
  | "CONVENTION_OUVERTURE_EXPORTE"
  | "GESTION_MANDAT_EXPORTE"
  | "PREFERENCE_COMM_EXPORTE";

export type EmergencyContact = {
  nom: string;
  prenoms: string;
  telephone: string;
};

export type Mandataire = {
  nom: string;
  prenoms: string;
  adresse: string;
  pieceIdentiteNumero: string;
  telephone: string;
};

export type AccountOpening = {
  compteType: string;
  mandataire: Mandataire;
  faitA: string;
  faitLe: string | null;
  attestationExactitude: boolean;
};

export type AccountConvention = {
  numeroCompte: string;
  accepteConvention: boolean;
  accepteTarifs: boolean;
  faitA: string;
  faitLe: string | null;
};

export type MandateAgreement = {
  horizonPlacement: "COURT" | "MOYEN" | "LONG" | string;
  profilInvestisseur: string;
  accepteMandat: boolean;
  accepteTarifs: boolean;
  faitA: string;
  faitLe: string | null;
};

export type CommunicationPreference = {
  modes: string[];
  faitA: string;
  faitLe: string | null;
};

export type Questionnaire = {
  civilite: string;
  nom: string;
  prenoms: string;
  dateNaissance: string | null;
  lieuNaissance: string;
  adresse: string;
  pieceIdentiteType: string;
  pieceIdentiteNumero: string;
  pieceIdentiteDelivrance: string | null;
  pieceIdentiteExpiration: string | null;
  nationalites: string;
  email: string;
  telephone: string;
  statutMatrimonial: string;
  statutMatrimonialPrecision: string;
  classification: string;
  classificationPrecision: string;
  profession: string;
  employeur: string;
  secteurActivite: string;
  adresseEmployeur: string;
  ancienneteEntreprise: string;
  employeurPrecedent: string;
  contactsUrgence: EmergencyContact[];
  decesDestination: string;
  decesPersonneNom: string;
  revenuMensuel: string;
  montantInvestir: string;
  provenanceFonds: string[];
  provenanceFondsPrecision: string;
  objectifInvestissement: string;
  communicationCanaux: string[];
  niveauComprehension: string;
  situationFinanciere: string;
  epargneActuelle: string;
  horizonFonds: string;
  frequenceSuivi: string;
  placementsDetenus: string[];
  placementsPrecision: string;
  toleranceRisque: string;
  baisseAcceptee: string;
};

export type InvestorDocument = {
  id: number;
  kind: DocumentKind;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
};

export type InvestorApplication = {
  id: string;
  status:
    | "DRAFT"
    | "QUESTIONNAIRE_DONE"
    | "SIGNATURE_DONE"
    | "OUVERTURE_DONE"
    | "CONVENTION_DONE"
    | "MANDAT_DONE"
    | "COMPLETED"
    | "REJECTED";
  currentStep: number;
  totalSteps: number;
  questionnaire: Questionnaire;
  accountOpening: AccountOpening;
  accountConvention: AccountConvention;
  mandateAgreement: MandateAgreement;
  communicationPreference: CommunicationPreference;
  documents: InvestorDocument[];
  createdAt: string;
  updatedAt: string;
  questionnaireCompletedAt: string | null;
};

export function emptyMandataire(): Mandataire {
  return { nom: "", prenoms: "", adresse: "", pieceIdentiteNumero: "", telephone: "" };
}

export function emptyAccountOpening(): AccountOpening {
  return {
    compteType: "INDIVIDUEL",
    mandataire: emptyMandataire(),
    faitA: "Dakar",
    faitLe: new Date().toISOString().slice(0, 10),
    attestationExactitude: false,
  };
}

export function emptyAccountConvention(): AccountConvention {
  return {
    numeroCompte: "",
    accepteConvention: false,
    accepteTarifs: false,
    faitA: "Dakar",
    faitLe: new Date().toISOString().slice(0, 10),
  };
}

export function mapHorizonFromQuestionnaire(horizonFonds?: string | null): "COURT" | "MOYEN" | "LONG" {
  const value = horizonFonds || "";
  if (value === "LT_1AN" || value === "1AN") return "COURT";
  if (value === "3ANS") return "MOYEN";
  return "LONG";
}

export function emptyMandateAgreement(horizonFonds?: string | null): MandateAgreement {
  return {
    horizonPlacement: mapHorizonFromQuestionnaire(horizonFonds),
    profilInvestisseur: "AUDACIEUX",
    accepteMandat: false,
    accepteTarifs: false,
    faitA: "Dakar",
    faitLe: new Date().toISOString().slice(0, 10),
  };
}

export function emptyCommunicationPreference(canaux?: string[] | null): CommunicationPreference {
  const modes: string[] = [];
  if (canaux?.includes("EMAIL")) modes.push("EMAIL");
  if (canaux?.includes("COURRIER") || canaux?.includes("TELEPHONE")) {
    /* telephone maps loosely; prefer EMAIL default */
  }
  if (modes.length === 0) modes.push("EMAIL");
  return {
    modes,
    faitA: "Dakar",
    faitLe: new Date().toISOString().slice(0, 10),
  };
}

export function emptyQuestionnaire(): Questionnaire {
  return {
    civilite: "",
    nom: "",
    prenoms: "",
    dateNaissance: null,
    lieuNaissance: "",
    adresse: "",
    pieceIdentiteType: "",
    pieceIdentiteNumero: "",
    pieceIdentiteDelivrance: null,
    pieceIdentiteExpiration: null,
    nationalites: "",
    email: "",
    telephone: "",
    statutMatrimonial: "",
    statutMatrimonialPrecision: "",
    classification: "",
    classificationPrecision: "",
    profession: "",
    employeur: "",
    secteurActivite: "",
    adresseEmployeur: "",
    ancienneteEntreprise: "",
    employeurPrecedent: "",
    contactsUrgence: [{ nom: "", prenoms: "", telephone: "" }],
    decesDestination: "",
    decesPersonneNom: "",
    revenuMensuel: "",
    montantInvestir: "",
    provenanceFonds: [],
    provenanceFondsPrecision: "",
    objectifInvestissement: "",
    communicationCanaux: [],
    niveauComprehension: "",
    situationFinanciere: "",
    epargneActuelle: "",
    horizonFonds: "",
    frequenceSuivi: "",
    placementsDetenus: [],
    placementsPrecision: "",
    toleranceRisque: "",
    baisseAcceptee: "",
  };
}

export function mergeQuestionnaire(raw?: Partial<Questionnaire> | null): Questionnaire {
  const base = emptyQuestionnaire();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    dateNaissance: raw.dateNaissance ?? null,
    pieceIdentiteDelivrance: raw.pieceIdentiteDelivrance ?? null,
    pieceIdentiteExpiration: raw.pieceIdentiteExpiration ?? null,
    contactsUrgence: raw.contactsUrgence?.length ? raw.contactsUrgence : base.contactsUrgence,
    provenanceFonds: raw.provenanceFonds ?? [],
    communicationCanaux: raw.communicationCanaux ?? [],
    placementsDetenus: raw.placementsDetenus ?? [],
  };
}

export function mergeAccountOpening(raw?: Partial<AccountOpening> | null): AccountOpening {
  const base = emptyAccountOpening();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    compteType: raw.compteType || "INDIVIDUEL",
    mandataire: { ...base.mandataire, ...(raw.mandataire ?? {}) },
    faitLe: raw.faitLe ?? base.faitLe,
    attestationExactitude: Boolean(raw.attestationExactitude),
  };
}

export function mergeAccountConvention(raw?: Partial<AccountConvention> | null): AccountConvention {
  const base = emptyAccountConvention();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    numeroCompte: raw.numeroCompte ?? "",
    faitLe: raw.faitLe ?? base.faitLe,
    accepteConvention: Boolean(raw.accepteConvention),
    accepteTarifs: Boolean(raw.accepteTarifs),
  };
}

export function mergeMandateAgreement(
  raw?: Partial<MandateAgreement> | null,
  horizonFonds?: string | null,
): MandateAgreement {
  const base = emptyMandateAgreement(horizonFonds);
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    horizonPlacement: raw.horizonPlacement || base.horizonPlacement,
    profilInvestisseur: "AUDACIEUX",
    faitLe: raw.faitLe ?? base.faitLe,
    accepteMandat: Boolean(raw.accepteMandat),
    accepteTarifs: Boolean(raw.accepteTarifs),
  };
}

export function mergeCommunicationPreference(
  raw?: Partial<CommunicationPreference> | null,
  canaux?: string[] | null,
): CommunicationPreference {
  const base = emptyCommunicationPreference(canaux);
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    modes: raw.modes?.length ? raw.modes : base.modes,
    faitLe: raw.faitLe ?? base.faitLe,
  };
}

export const APPLICATION_KEY = "finx-investor-application-id";
