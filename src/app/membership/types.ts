/** Écrans de la plateforme (maquette) */
export type ScreenKey =
  | "accueil"
  | "membres"
  | "roles"
  | "evenements"
  | "programmes"
  | "partenaires"
  | "souscription"
  | "investissements"
  | "documents"
  | "mon-espace"
  | "backoffice";

/** Statuts d'adhésion — Vision FINX CLUB §3 */
export type MemberStatus =
  | "invite"
  | "simple"
  | "actif"
  | "confirme"
  | "suspendu";

/** Rôle d'accès (permissions d'écrans) */
export interface Role {
  id: string;
  label: string;
  description: string;
  /** Couleur badge */
  tone: "cyan" | "navy" | "premium" | "muted" | "danger";
  /** Écrans autorisés par défaut */
  screens: ScreenKey[];
  /** Rôle système non supprimable */
  locked?: boolean;
}

export interface Member {
  id: string;
  nom: string;
  email: string;
  avatar: string;
  /** Statut club */
  statut: MemberStatus;
  /** Niveau Actif N1–N5 (0 si non applicable) */
  niveau: number;
  /** Badge investisseur (≥ 500 000 FCFA) — indépendant du statut */
  badgeInvestisseur: boolean;
  /** Rôle d'accès principal */
  roleId: string;
  /** Fonctions de gouvernance (badges profil) */
  fonctions: string[];
  cotisation: "À jour" | "En retard" | "Impayée" | "—";
  capital: string;
  adhesion: string;
  /** Restriction fine : écrans accordés en plus du rôle */
  grantScreens: ScreenKey[];
  /** Restriction fine : écrans retirés malgré le rôle */
  denyScreens: ScreenKey[];
}

export const ALL_SCREENS: { key: ScreenKey; label: string; group: string }[] = [
  { key: "accueil", label: "Tableau de bord", group: "Principal" },
  { key: "membres", label: "Membres", group: "Gestion" },
  { key: "roles", label: "Rôles & accès", group: "Gestion" },
  { key: "evenements", label: "Événements", group: "Gestion" },
  { key: "programmes", label: "Programmes", group: "Gestion" },
  { key: "partenaires", label: "Partenariats", group: "Gestion" },
  { key: "souscription", label: "Souscriptions", group: "Gestion" },
  { key: "investissements", label: "Investissements", group: "Suivi" },
  { key: "documents", label: "Documents", group: "Suivi" },
  { key: "mon-espace", label: "Mon Espace", group: "Membres" },
  { key: "backoffice", label: "Back-office", group: "Admin" },
];

export const STATUS_LABELS: Record<MemberStatus, string> = {
  invite: "Invité / Visiteur",
  simple: "Membre Simple",
  actif: "Membre Actif",
  confirme: "Membre Confirmé",
  suspendu: "Suspendu",
};
