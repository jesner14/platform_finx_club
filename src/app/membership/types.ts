/** Écrans de la fonctionnalité Membres / Statuts / Rôles / Gouvernance */
export type ScreenKey =
  | "accueil"
  | "membres"
  | "roles"
  | "gouvernance"
  | "participations"
  | "sessions"
  | "mon-espace"
  | "parametres";

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
}

export interface Member {
  id: string;
  nom: string;
  email: string;
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
}

export const ALL_SCREENS: { key: ScreenKey; label: string; group: string }[] = [
  { key: "accueil", label: "Tableau de bord", group: "Principal" },
  { key: "membres", label: "Membres", group: "Gestion" },
  { key: "roles", label: "Rôles & privilèges", group: "Gestion" },
  { key: "gouvernance", label: "Gouvernance", group: "Gestion" },
  { key: "participations", label: "Participations", group: "Suivi" },
  { key: "sessions", label: "Sessions réservées", group: "Suivi" },
  { key: "mon-espace", label: "Mon Espace", group: "Membre" },
  { key: "parametres", label: "Paramètres progression", group: "Admin" },
];

export const STATUS_LABELS: Record<MemberStatus, string> = {
  invite: "Invité / Visiteur",
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
