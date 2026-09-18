import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "../api";
import { useAuth, type AuthUser } from "../auth/AuthContext";
import type {
  FonctionGouvernance,
  HistoriqueStatut,
  Member,
  Participation,
  ParticipationType,
  ProgressionParams,
  Role,
  ScreenKey,
  SessionReservee,
} from "./types";
import { ALL_SCREENS, DEFAULT_PARAMS } from "./types";

export type HistoriquePath =
  | "historiques-performances"
  | "historiques-montants-investis"
  | "historiques-capitaux-nets";

export interface ImportReport {
  membersCreated: number;
  membersMatched: number;
  depositsUpserted: number;
  createdMatricules: string[];
}

interface ClubSnapshot {
  members: Member[];
  roles: Role[];
  params: ProgressionParams;
  participations: Participation[];
  history: HistoriqueStatut[];
  sessions: SessionReservee[];
}

interface MembershipContextValue {
  loading: boolean;
  saving: boolean;
  error: string | null;
  members: Member[];
  roles: Role[];
  params: ProgressionParams;
  participations: Participation[];
  history: HistoriqueStatut[];
  sessions: SessionReservee[];
  currentUserId: string;
  currentUser: Member;
  currentRole: Role;
  effectiveScreens: ScreenKey[];
  canAccess: (screen: ScreenKey) => boolean;
  reload: () => Promise<void>;
  addMember: (data: Omit<Member, "id" | "avatar" | "fonctions" | "nbPresences" | "nbAbsences" | "consecutives" | "enRecuperation" | "groupes"> & Partial<Member> & { username: string; password: string }) => Promise<string | null>;
  updateMember: (id: string, patch: Partial<Member> & { password?: string }) => Promise<string | null>;
  updateMyProfile: (input: { nom: string; email: string; username: string; password?: string }) => Promise<string | null>;
  removeMember: (id: string) => Promise<string | null>;
  removeMembers: (ids: string[]) => Promise<string | null>;
  updateRoleScreens: (roleId: string, screens: ScreenKey[]) => Promise<string | null>;
  addRole: (role: Omit<Role, "id"> & { id?: string }) => Promise<string | null>;
  updateParams: (patch: Partial<ProgressionParams>) => Promise<string | null>;
  recordParticipation: (input: {
    memberId: string;
    type: ParticipationType;
    titre: string;
    present: boolean;
    date?: string;
  }) => Promise<string | null>;
  nominateFonction: (memberId: string, data: Omit<FonctionGouvernance, "id" | "active">) => Promise<string | null>;
  endFonction: (memberId: string, fonctionId: string) => Promise<string | null>;
  toggleSessionInscription: (sessionId: string, memberId: string) => Promise<string | null>;
  importDepots: (file: File) => Promise<{ report: ImportReport | null; error: string | null }>;
  createDepot: (input: { memberId: string; date: string; montant: number }) => Promise<string | null>;
  deleteAllDepots: () => Promise<{ deleted: number; error: string | null }>;
  importRetraits: (file: File) => Promise<{ report: ImportReport | null; error: string | null }>;
  createRetrait: (input: { memberId: string; date: string; montant: number }) => Promise<string | null>;
  deleteAllRetraits: () => Promise<{ deleted: number; error: string | null }>;
  importSoldesParts: (file: File) => Promise<{ report: ImportReport | null; error: string | null }>;
  createSoldePart: (input: { memberId: string; date: string; nombreParts: number }) => Promise<string | null>;
  deleteAllSoldesParts: () => Promise<{ deleted: number; error: string | null }>;
  importEtatsParts: (file: File) => Promise<{ report: ImportReport | null; error: string | null }>;
  createEtatPart: (input: { memberId: string; date: string; nombreParts: number }) => Promise<string | null>;
  deleteAllEtatsParts: () => Promise<{ deleted: number; error: string | null }>;
  importPortefeuille: (file: File) => Promise<{ report: { upserted: number; skipped: number } | null; error: string | null }>;
  createPortefeuilleLigne: (input: { symbole: string; titre: string; secteur?: string }) => Promise<string | null>;
  deleteAllPortefeuille: () => Promise<{ deleted: number; error: string | null }>;
  importHistorique: (path: HistoriquePath, file: File) => Promise<{ report: ImportReport | null; error: string | null }>;
  createHistorique: (path: HistoriquePath, input: { memberId: string; date: string; valeur: number }) => Promise<string | null>;
  deleteAllHistoriques: (path: HistoriquePath) => Promise<{ deleted: number; error: string | null }>;
  importValeursLiquidatives: (file: File) => Promise<{ report: { upserted: number; skipped: number } | null; error: string | null }>;
  createValeurLiquidative: (input: { date: string; actifNet?: number | null; nombreParts?: number | null; valeur: number }) => Promise<string | null>;
  deleteAllValeursLiquidatives: () => Promise<{ deleted: number; error: string | null }>;
  screenLabel: (key: ScreenKey) => string;
  progressionVersSuivant: (m: Member) => { current: number; target: number; pct: number; label: string };
}

const FALLBACK_ROLE: Role = {
  id: "admin",
  label: "Administrateur",
  description: "",
  tone: "danger",
  screens: ALL_SCREENS.map((s) => s.key),
  locked: true,
};

const MembershipContext = createContext<MembershipContextValue | null>(null);

function initials(nom: string) {
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "XX";
}

function normalizeParams(params: ProgressionParams): ProgressionParams {
  const raw = (params.participationsParNiveau ?? {}) as Record<string | number, number>;
  return {
    ...params,
    participationsParNiveau: {
      1: Number(raw[1] ?? raw["1"] ?? 2),
      2: Number(raw[2] ?? raw["2"] ?? 4),
      3: Number(raw[3] ?? raw["3"] ?? 6),
      4: Number(raw[4] ?? raw["4"] ?? 8),
      5: Number(raw[5] ?? raw["5"] ?? 10),
    },
    membreVoitToutesValeursLiquidatives: params.membreVoitToutesValeursLiquidatives !== false,
  };
}

function virtualMember(user: AuthUser | null): Member {
  return {
    id: "",
    matricule: "",
    nom: user?.nom ?? "Utilisateur",
    email: user?.email ?? "",
    avatar: initials(user?.nom ?? "U"),
    statut: "confirme",
    niveau: 0,
    badgeInvestisseur: false,
    roleId: "admin",
    fonctions: [],
    cotisation: "—",
    capitalInvesti: 0,
    adhesion: "",
    groupes: [],
    nbPresences: 0,
    nbAbsences: 0,
    consecutives: 0,
    enRecuperation: false,
    grantScreens: [],
    denyScreens: [],
  };
}

export function computeEffectiveScreens(member: Member, roles: Role[]): ScreenKey[] {
  const role = roles.find((r) => r.id === member.roleId);
  const base = new Set<ScreenKey>(role?.screens ?? ["accueil", "mon-espace"]);
  for (const s of member.grantScreens) base.add(s);
  for (const s of member.denyScreens) base.delete(s);
  if (member.statut === "suspendu") {
    return (["accueil", "mon-espace"] as ScreenKey[]).filter((s) => base.has(s));
  }
  return ALL_SCREENS.map((s) => s.key).filter((k) => base.has(k));
}

export function MembershipProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, patchUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [params, setParams] = useState<ProgressionParams>(DEFAULT_PARAMS);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [history, setHistory] = useState<HistoriqueStatut[]>([]);
  const [sessions, setSessions] = useState<SessionReservee[]>([]);

  const applySnapshot = useCallback((data: ClubSnapshot) => {
    setMembers(data.members ?? []);
    setRoles(data.roles ?? []);
    setParams(normalizeParams(data.params ?? DEFAULT_PARAMS));
    setParticipations(data.participations ?? []);
    setHistory(data.history ?? []);
    setSessions(data.sessions ?? []);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      applySnapshot(await api<ClubSnapshot>("/api/club"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les données du club.");
    } finally {
      setLoading(false);
    }
  }, [applySnapshot]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void reload();
  }, [isAuthenticated, reload]);

  const mutate = useCallback(async (fn: () => Promise<ClubSnapshot>) => {
    setSaving(true);
    setError(null);
    try {
      applySnapshot(await fn());
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'opération a échoué.";
      setError(message);
      return message;
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const currentUser = useMemo(() => {
    const match = members.find((m) => (m.email ?? "").toLowerCase() === (user?.email ?? "").toLowerCase() && m.email);
    return match ?? virtualMember(user);
  }, [members, user]);

  const currentRole = useMemo(
    () => roles.find((r) => r.id === currentUser.roleId) ?? roles.find((r) => r.id === "admin") ?? FALLBACK_ROLE,
    [roles, currentUser.roleId],
  );

  const effectiveScreens = useMemo(() => {
    if (user?.role === "SUPER_ADMIN") return ALL_SCREENS.map((s) => s.key);
    if (!currentUser.id) return ["accueil", "mon-espace"] as ScreenKey[];
    return computeEffectiveScreens(currentUser, roles);
  }, [user?.role, currentUser, roles]);

  const canAccess = useCallback(
    (screen: ScreenKey) => effectiveScreens.includes(screen),
    [effectiveScreens],
  );

  const addMember: MembershipContextValue["addMember"] = useCallback((data) => {
    return mutate(() => api("/api/members", {
      method: "POST",
      body: JSON.stringify({
        nom: data.nom,
        email: data.email,
        matricule: data.matricule,
        username: data.username,
        password: data.password,
        statut: data.statut,
        niveau: data.niveau ?? 0,
        roleId: data.roleId,
        cotisation: data.cotisation,
        capitalInvesti: data.capitalInvesti,
        adhesion: data.adhesion,
        grantScreens: data.grantScreens ?? [],
        denyScreens: data.denyScreens ?? [],
      }),
    }));
  }, [mutate]);

  const updateMember = useCallback((id: string, patch: Partial<Member>) => {
    return mutate(() => api(`/api/members/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }));
  }, [mutate]);

  const updateMyProfile = useCallback(async (input: { nom: string; email: string; username: string; password?: string }) => {
    const payload: { nom: string; email: string; username: string; password?: string } = {
      nom: input.nom,
      email: input.email,
      username: input.username,
    };
    if (input.password) payload.password = input.password;
    const err = await mutate(() => api("/api/members/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }));
    if (!err) {
      patchUser({ nom: input.nom.trim(), email: input.email.trim() });
    }
    return err;
  }, [mutate, patchUser]);

  const removeMember = useCallback((id: string) => {
    return mutate(() => api(`/api/members/${encodeURIComponent(id)}`, { method: "DELETE" }));
  }, [mutate]);

  const removeMembers = useCallback((ids: string[]) => {
    return mutate(() => api("/api/members/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }));
  }, [mutate]);

  const updateRoleScreens = useCallback((roleId: string, screens: ScreenKey[]) => {
    return mutate(() => api(`/api/roles/${encodeURIComponent(roleId)}/screens`, {
      method: "PUT",
      body: JSON.stringify({ screens }),
    }));
  }, [mutate]);

  const addRole = useCallback((role: Omit<Role, "id"> & { id?: string }) => {
    return mutate(() => api("/api/roles", {
      method: "POST",
      body: JSON.stringify(role),
    }));
  }, [mutate]);

  const updateParams = useCallback((patch: Partial<ProgressionParams>) => {
    return mutate(() => api("/api/params", {
      method: "PUT",
      body: JSON.stringify(patch),
    }));
  }, [mutate]);

  const recordParticipation: MembershipContextValue["recordParticipation"] = useCallback(
    ({ memberId, type, titre, present, date }) => {
      return mutate(() => api("/api/participations", {
        method: "POST",
        body: JSON.stringify({ memberId, type, titre, present, date }),
      }));
    },
    [mutate],
  );

  const nominateFonction: MembershipContextValue["nominateFonction"] = useCallback(
    (memberId, data) => {
      return mutate(() => api(`/api/members/${encodeURIComponent(memberId)}/fonctions`, {
        method: "POST",
        body: JSON.stringify(data),
      }));
    },
    [mutate],
  );

  const endFonction = useCallback((memberId: string, fonctionId: string) => {
    return mutate(() => api(
      `/api/members/${encodeURIComponent(memberId)}/fonctions/${encodeURIComponent(fonctionId)}/end`,
      { method: "POST" },
    ));
  }, [mutate]);

  const toggleSessionInscription = useCallback((sessionId: string, memberId: string) => {
    if (!memberId) return Promise.resolve("Aucune fiche membre associée à ce compte.");
    return mutate(() => api(`/api/sessions/${encodeURIComponent(sessionId)}/toggle`, {
      method: "POST",
      body: JSON.stringify({ memberId }),
    }));
  }, [mutate]);

  const importDepots = useCallback(async (file: File) => {
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const report = await api<ImportReport>("/api/admin/depots/import", { method: "POST", body: form });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return { report, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'import a échoué.";
      setError(message);
      return { report: null, error: message };
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const createDepot = useCallback(async (input: { memberId: string; date: string; montant: number }) => {
    setSaving(true);
    setError(null);
    try {
      await api("/api/admin/depots", { method: "POST", body: JSON.stringify(input) });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'enregistrement du dépôt a échoué.";
      setError(message);
      return message;
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const deleteAllDepots = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await api<{ deleted: number }>("/api/admin/depots", { method: "DELETE" });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return { deleted: result.deleted, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "La suppression a échoué.";
      setError(message);
      return { deleted: 0, error: message };
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const importRetraits = useCallback(async (file: File) => {
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const report = await api<ImportReport>("/api/admin/retraits/import", { method: "POST", body: form });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return { report, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'import a échoué.";
      setError(message);
      return { report: null, error: message };
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const createRetrait = useCallback(async (input: { memberId: string; date: string; montant: number }) => {
    setSaving(true);
    setError(null);
    try {
      await api("/api/admin/retraits", { method: "POST", body: JSON.stringify(input) });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'enregistrement du retrait a échoué.";
      setError(message);
      return message;
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const deleteAllRetraits = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await api<{ deleted: number }>("/api/admin/retraits", { method: "DELETE" });
      return { deleted: result.deleted, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "La suppression a échoué.";
      setError(message);
      return { deleted: 0, error: message };
    } finally {
      setSaving(false);
    }
  }, []);

  const importSoldesParts = useCallback(async (file: File) => {
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const report = await api<ImportReport>("/api/admin/soldes-parts/import", { method: "POST", body: form });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return { report, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'import a échoué.";
      setError(message);
      return { report: null, error: message };
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const createSoldePart = useCallback(async (input: { memberId: string; date: string; nombreParts: number }) => {
    setSaving(true);
    setError(null);
    try {
      await api("/api/admin/soldes-parts", { method: "POST", body: JSON.stringify(input) });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'enregistrement du solde a échoué.";
      setError(message);
      return message;
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const deleteAllSoldesParts = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await api<{ deleted: number }>("/api/admin/soldes-parts", { method: "DELETE" });
      return { deleted: result.deleted, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "La suppression a échoué.";
      setError(message);
      return { deleted: 0, error: message };
    } finally {
      setSaving(false);
    }
  }, []);

  const importEtatsParts = useCallback(async (file: File) => {
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const report = await api<ImportReport>("/api/admin/etats-parts/import", { method: "POST", body: form });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return { report, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'import a échoué.";
      setError(message);
      return { report: null, error: message };
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const createEtatPart = useCallback(async (input: { memberId: string; date: string; nombreParts: number }) => {
    setSaving(true);
    setError(null);
    try {
      await api("/api/admin/etats-parts", { method: "POST", body: JSON.stringify(input) });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'enregistrement de l'état des parts a échoué.";
      setError(message);
      return message;
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const deleteAllEtatsParts = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await api<{ deleted: number }>("/api/admin/etats-parts", { method: "DELETE" });
      return { deleted: result.deleted, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "La suppression a échoué.";
      setError(message);
      return { deleted: 0, error: message };
    } finally {
      setSaving(false);
    }
  }, []);

  const importPortefeuille = useCallback(async (file: File) => {
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const report = await api<{ upserted: number; skipped: number }>("/api/admin/portefeuille/import", { method: "POST", body: form });
      return { report, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'import a échoué.";
      setError(message);
      return { report: null, error: message };
    } finally {
      setSaving(false);
    }
  }, []);

  const createPortefeuilleLigne = useCallback(async (input: { symbole: string; titre: string; secteur?: string }) => {
    setSaving(true);
    setError(null);
    try {
      await api("/api/admin/portefeuille", { method: "POST", body: JSON.stringify(input) });
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'enregistrement de la ligne a échoué.";
      setError(message);
      return message;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteAllPortefeuille = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await api<{ deleted: number }>("/api/admin/portefeuille", { method: "DELETE" });
      return { deleted: result.deleted, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "La suppression a échoué.";
      setError(message);
      return { deleted: 0, error: message };
    } finally {
      setSaving(false);
    }
  }, []);

  const importHistorique = useCallback(async (path: HistoriquePath, file: File) => {
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const report = await api<ImportReport>(`/api/admin/${path}/import`, { method: "POST", body: form });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return { report, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'import a échoué.";
      setError(message);
      return { report: null, error: message };
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const createHistorique = useCallback(async (path: HistoriquePath, input: { memberId: string; date: string; valeur: number }) => {
    setSaving(true);
    setError(null);
    try {
      await api(`/api/admin/${path}`, { method: "POST", body: JSON.stringify(input) });
      applySnapshot(await api<ClubSnapshot>("/api/club"));
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'enregistrement a échoué.";
      setError(message);
      return message;
    } finally {
      setSaving(false);
    }
  }, [applySnapshot]);

  const deleteAllHistoriques = useCallback(async (path: HistoriquePath) => {
    setSaving(true);
    setError(null);
    try {
      const result = await api<{ deleted: number }>(`/api/admin/${path}`, { method: "DELETE" });
      return { deleted: result.deleted, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "La suppression a échoué.";
      setError(message);
      return { deleted: 0, error: message };
    } finally {
      setSaving(false);
    }
  }, []);

  const importValeursLiquidatives = useCallback(async (file: File) => {
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const report = await api<{ upserted: number; skipped: number }>("/api/admin/valeurs-liquidatives/import", { method: "POST", body: form });
      return { report, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'import a échoué.";
      setError(message);
      return { report: null, error: message };
    } finally {
      setSaving(false);
    }
  }, []);

  const createValeurLiquidative = useCallback(async (input: { date: string; actifNet?: number | null; nombreParts?: number | null; valeur: number }) => {
    setSaving(true);
    setError(null);
    try {
      await api("/api/admin/valeurs-liquidatives", { method: "POST", body: JSON.stringify(input) });
      return null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "L'enregistrement a échoué.";
      setError(message);
      return message;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteAllValeursLiquidatives = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await api<{ deleted: number }>("/api/admin/valeurs-liquidatives", { method: "DELETE" });
      return { deleted: result.deleted, error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "La suppression a échoué.";
      setError(message);
      return { deleted: 0, error: message };
    } finally {
      setSaving(false);
    }
  }, []);

  const progressionVersSuivant = useCallback(
    (m: Member) => {
      if (m.statut === "confirme") return { current: m.nbPresences, target: m.nbPresences || 1, pct: 100, label: "Statut permanent" };
      if (m.statut === "invite") return { current: 0, target: 1, pct: 0, label: "Demande d'adhésion / 1ère activité" };
      if (m.statut === "simple" && m.enRecuperation) {
        return {
          current: m.consecutives,
          target: params.presencesPourRecuperation,
          pct: Math.min(100, (m.consecutives / params.presencesPourRecuperation) * 100),
          label: "Récupération Actif",
        };
      }
      if (m.statut === "simple") {
        const t = params.participationsParNiveau[1];
        return { current: m.nbPresences, target: t, pct: Math.min(100, (m.nbPresences / t) * 100), label: "Vers Membre Actif N1" };
      }
      if (m.statut === "actif") {
        if (m.nbPresences >= params.participationsPourConfirme) {
          return { current: m.nbPresences, target: params.participationsPourConfirme, pct: 100, label: "Éligible Confirmé" };
        }
        const nextN = Math.min(5, (m.niveau || 1) + 1) as 1 | 2 | 3 | 4 | 5;
        const t = params.participationsParNiveau[nextN];
        return {
          current: m.nbPresences,
          target: t,
          pct: Math.min(100, (m.nbPresences / t) * 100),
          label: m.niveau >= 5 ? "Vers Membre Confirmé" : `Vers N${nextN}`,
        };
      }
      return { current: 0, target: 1, pct: 0, label: "—" };
    },
    [params],
  );

  const screenLabel = useCallback(
    (key: ScreenKey) => ALL_SCREENS.find((s) => s.key === key)?.label ?? key,
    [],
  );

  const value = useMemo(
    () => ({
      loading, saving, error, members, roles, params, participations, history, sessions,
      currentUserId: currentUser.id, currentUser, currentRole, effectiveScreens, canAccess,
      reload, addMember, updateMember, updateMyProfile, removeMember, removeMembers,
      updateRoleScreens, addRole, updateParams, recordParticipation,
      nominateFonction, endFonction, toggleSessionInscription, importDepots, createDepot, deleteAllDepots,
      importRetraits, createRetrait, deleteAllRetraits,
      importSoldesParts, createSoldePart, deleteAllSoldesParts,
      importEtatsParts, createEtatPart, deleteAllEtatsParts,
      importPortefeuille, createPortefeuilleLigne, deleteAllPortefeuille,
      importHistorique, createHistorique, deleteAllHistoriques,
      importValeursLiquidatives, createValeurLiquidative, deleteAllValeursLiquidatives,
      screenLabel, progressionVersSuivant,
    }),
    [
      loading, saving, error, members, roles, params, participations, history, sessions,
      currentUser, currentRole, effectiveScreens, canAccess, reload,
      addMember, updateMember, updateMyProfile, removeMember, removeMembers, updateRoleScreens, addRole,
      updateParams, recordParticipation, nominateFonction, endFonction,
      toggleSessionInscription, importDepots, createDepot, deleteAllDepots,
      importRetraits, createRetrait, deleteAllRetraits,
      importSoldesParts, createSoldePart, deleteAllSoldesParts,
      importEtatsParts, createEtatPart, deleteAllEtatsParts,
      importPortefeuille, createPortefeuilleLigne, deleteAllPortefeuille,
      importHistorique, createHistorique, deleteAllHistoriques,
      importValeursLiquidatives, createValeurLiquidative, deleteAllValeursLiquidatives,
      screenLabel, progressionVersSuivant,
    ],
  );

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembership() {
  const ctx = useContext(MembershipContext);
  if (!ctx) throw new Error("useMembership must be used within MembershipProvider");
  return ctx;
}
