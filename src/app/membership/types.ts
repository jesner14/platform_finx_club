/** Écrans de la fonctionnalité Membres / Statuts / Rôles / Gouvernance */
export type ScreenKey =
  | "accueil"
  | "membres"
  | "roles"
  | "gouvernance"
  | "participations"
  | "sessions"
  | "inscription"
  | "mon-espace"
  | "parametres"
  | "depots"
  | "valeur-liquidative"
  | "retraits"
  | "solde-parts"
  | "etat-parts"
  | "valeur-portefeuille"
  | "historique-performances"
  | "historique-montants-investis"
  | "historique-capitaux-nets";

export type MemberStatus =
  | "invite"
  | "simple"
  | "actif"
  | "confirme"
  | "suspendu";

export type ParticipationType =
  | "reunion"
  | "programme"
  | "activite"
  | "session_info"
  | "evenement";

export type ChangeType =
  | "montee_niveau"
  | "retrogradation"
  | "recuperation"
  | "confirmation"
  | "badge_investisseur"
  | "autre";

export type FonctionType = "president_groupe" | "president_pole" | "secretaire";

export interface Role {
  id: string;
  label: string;
  description: string;
  tone: "cyan" | "navy" | "premium" | "muted" | "danger";
  screens: ScreenKey[];
  locked?: boolean;
}

export interface FonctionGouvernance {
  id: string;
  type: FonctionType;
  groupeOuPole: string;
  dateNomination: string;
  dureeMandat: string;
  responsabilites: string;
  active: boolean;
}

export interface Participation {
  id: string;
  memberId: string;
  date: string;
  type: ParticipationType;
  titre: string;
  present: boolean;
}

export interface HistoriqueStatut {
  id: string;
  memberId: string;
  date: string;
  ancienStatut: MemberStatus;
  nouveauStatut: MemberStatus;
  ancienNiveau: number;
  nouveauNiveau: number;
  motif: string;
  type: ChangeType;
}

export interface SessionReservee {
  id: string;
  titre: string;
  date: string;
  heure: string;
  lieu: string;
  lienVisio: string;
  places: number;
  inscrits: string[];
  documents: string[];
  replay?: string;
}

export interface ProgressionParams {
  participationsParNiveau: Record<1 | 2 | 3 | 4 | 5, number>;
  participationsPourConfirme: number;
  absencesAvantRetrogradation: number;
  presencesPourRecuperation: number;
  seuilInvestisseurFcfa: number;
  engagementMensuelConfirmeFcfa: number;
  niveauMinGouvernance: number;
  /** Si faux, le membre ne voit que la dernière VL */
  membreVoitToutesValeursLiquidatives: boolean;
}

export interface Member {
  id: string;
  matricule: string;
  nom: string;
  email: string | null;
  username?: string | null;
  avatar: string;
  statut: MemberStatus;
  niveau: number;
  badgeInvestisseur: boolean;
  roleId: string;
  fonctions: FonctionGouvernance[];
  cotisation: "À jour" | "En retard" | "Impayée" | "—";
  capitalInvesti: number;
  adhesion: string;
  groupes: string[];
  nbPresences: number;
  nbAbsences: number;
  consecutives: number;
  /** Après rétrogradation, en attente de récupération */
  enRecuperation: boolean;
  grantScreens: ScreenKey[];
  denyScreens: ScreenKey[];
  investorApplicationId?: string | null;
  pendingInvestorValidation?: boolean;
}

export const ALL_SCREENS: { key: ScreenKey; label: string; group: string; parent?: ScreenKey }[] = [
  { key: "accueil", label: "Tableau de bord", group: "Principal" },
  { key: "membres", label: "Membres", group: "Gestion" },
  { key: "inscription", label: "Inscription", group: "Gestion", parent: "membres" },
  { key: "roles", label: "Rôles & privilèges", group: "Gestion", parent: "membres" },
  { key: "gouvernance", label: "Gouvernance", group: "Gestion", parent: "membres" },
  { key: "participations", label: "Participations", group: "Gestion", parent: "membres" },
  { key: "sessions", label: "Sessions réservées", group: "Gestion", parent: "membres" },
  { key: "mon-espace", label: "Mon Espace", group: "Membre" },
  { key: "depots", label: "Dépôts", group: "Admin" },
  { key: "valeur-liquidative", label: "Valeur liquidative", group: "Admin" },
  { key: "retraits", label: "Retraits", group: "Admin" },
  { key: "solde-parts", label: "Solde des parts", group: "Admin" },
  { key: "etat-parts", label: "État des parts", group: "Admin" },
  { key: "valeur-portefeuille", label: "Valeur du portefeuille", group: "Admin" },
  { key: "historique-performances", label: "Historique des performances", group: "Admin" },
  { key: "historique-montants-investis", label: "Historique des montants investis", group: "Admin" },
  { key: "historique-capitaux-nets", label: "Historique des capitaux nets", group: "Admin" },
  { key: "parametres", label: "Paramètres progression", group: "Admin" },
];

export const MEMBER_SUBMENUS = ALL_SCREENS.filter((s) => s.parent === "membres");

export const ADMIN_NAV_GROUPS: {
  id: string;
  label: string;
  icon: ScreenKey;
  tabs: { key: ScreenKey; label: string }[];
}[] = [
  {
    id: "mouvements",
    label: "Mouvements",
    icon: "depots",
    tabs: [
      { key: "depots", label: "Dépôts" },
      { key: "retraits", label: "Retraits" },
    ],
  },
  {
    id: "parts",
    label: "Parts",
    icon: "solde-parts",
    tabs: [
      { key: "solde-parts", label: "Solde de parts" },
      { key: "etat-parts", label: "État des parts" },
      { key: "valeur-liquidative", label: "Valeur liquidative" },
    ],
  },
  {
    id: "portefeuille",
    label: "Portefeuille",
    icon: "valeur-portefeuille",
    tabs: [{ key: "valeur-portefeuille", label: "Positions" }],
  },
  {
    id: "historiques",
    label: "Historiques",
    icon: "historique-performances",
    tabs: [
      { key: "historique-performances", label: "Performances" },
      { key: "historique-montants-investis", label: "Montants investis" },
      { key: "historique-capitaux-nets", label: "Capitaux nets" },
    ],
  },
  {
    id: "parametres",
    label: "Paramètres",
    icon: "parametres",
    tabs: [{ key: "parametres", label: "Progression" }],
  },
];

export const ADMIN_SCREEN_KEYS = ADMIN_NAV_GROUPS.flatMap((group) => group.tabs.map((tab) => tab.key));

export const DEFAULT_PARAMS: ProgressionParams = {
  participationsParNiveau: { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 },
  participationsPourConfirme: 6,
  absencesAvantRetrogradation: 2,
  presencesPourRecuperation: 2,
  seuilInvestisseurFcfa: 500_000,
  engagementMensuelConfirmeFcfa: 50_000,
  niveauMinGouvernance: 3,
  membreVoitToutesValeursLiquidatives: true,
};

export const STATUS_LABELS: Record<MemberStatus, string> = {
  invite: "Candidat investisseur",
  simple: "Membre Simple",
  actif: "Membre Actif",
  confirme: "Membre Confirmé",
  suspendu: "Suspendu",
};

export const PARTICIPATION_LABELS: Record<ParticipationType, string> = {
  reunion: "Réunion",
  programme: "Programme",
  activite: "Activité",
  session_info: "Session info",
  evenement: "Événement",
};

export const FONCTION_LABELS: Record<FonctionType, string> = {
  president_groupe: "Président de Groupe",
  president_pole: "Président de Pôle",
  secretaire: "Secrétaire",
};

export const CHANGE_LABELS: Record<ChangeType, string> = {
  montee_niveau: "Montée de niveau",
  retrogradation: "Rétrogradation",
  recuperation: "Récupération",
  confirmation: "Confirmation",
  badge_investisseur: "Badge Investisseur",
  autre: "Autre",
};
