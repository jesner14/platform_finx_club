import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_HISTORY,
  INITIAL_MEMBERS,
  INITIAL_PARAMS,
  INITIAL_PARTICIPATIONS,
  INITIAL_ROLES,
  INITIAL_SESSIONS,
} from "./seed";
import type {
  FonctionGouvernance,
  FonctionType,
  HistoriqueStatut,
  Member,
  MemberStatus,
  Participation,
  ParticipationType,
  ProgressionParams,
  Role,
  ScreenKey,
  SessionReservee,
} from "./types";
import { ALL_SCREENS } from "./types";

interface MembershipContextValue {
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
  setCurrentUserId: (id: string) => void;
  addMember: (data: Omit<Member, "id" | "avatar" | "fonctions" | "nbPresences" | "nbAbsences" | "consecutives" | "enRecuperation" | "groupes"> & Partial<Member>) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  removeMember: (id: string) => void;
  updateRoleScreens: (roleId: string, screens: ScreenKey[]) => void;
  addRole: (role: Omit<Role, "id"> & { id?: string }) => void;
  updateParams: (patch: Partial<ProgressionParams>) => void;
  recordParticipation: (input: {
    memberId: string;
    type: ParticipationType;
    titre: string;
    present: boolean;
    date?: string;
  }) => void;
  nominateFonction: (memberId: string, data: Omit<FonctionGouvernance, "id" | "active">) => string | null;
  endFonction: (memberId: string, fonctionId: string) => void;
  toggleSessionInscription: (sessionId: string, memberId: string) => string | null;
  screenLabel: (key: ScreenKey) => string;
  progressionVersSuivant: (m: Member) => { current: number; target: number; pct: number; label: string };
}

const MembershipContext = createContext<MembershipContextValue | null>(null);

function initials(nom: string) {
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "XX";
}

function nextId(prefix: string, items: { id: string }[]) {
  const nums = items.map((i) => parseInt(i.id.replace(/\D/g, ""), 10)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
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

function niveauFromPresences(presences: number, params: ProgressionParams): number {
  let niveau = 0;
  for (let n = 1; n <= 5; n++) {
    if (presences >= params.participationsParNiveau[n as 1 | 2 | 3 | 4 | 5]) niveau = n;
  }
  return niveau;
}

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [params, setParams] = useState<ProgressionParams>(INITIAL_PARAMS);
  const [participations, setParticipations] = useState<Participation[]>(INITIAL_PARTICIPATIONS);
  const [history, setHistory] = useState<HistoriqueStatut[]>(INITIAL_HISTORY);
  const [sessions, setSessions] = useState<SessionReservee[]>(INITIAL_SESSIONS);
  const [currentUserId, setCurrentUserId] = useState("M-0001");

  const currentUser = useMemo(
    () => members.find((m) => m.id === currentUserId) ?? members[0],
    [members, currentUserId],
  );
  const currentRole = useMemo(
    () => roles.find((r) => r.id === currentUser.roleId) ?? roles[0],
    [roles, currentUser.roleId],
  );
  const effectiveScreens = useMemo(
    () => computeEffectiveScreens(currentUser, roles),
    [currentUser, roles],
  );
  const canAccess = useCallback(
    (screen: ScreenKey) => effectiveScreens.includes(screen),
    [effectiveScreens],
  );

  const pushHistory = useCallback((entry: Omit<HistoriqueStatut, "id">) => {
    setHistory((prev) => [{ ...entry, id: nextId("H", prev) }, ...prev]);
  }, []);

  const addMember: MembershipContextValue["addMember"] = useCallback((data) => {
    setMembers((prev) => {
      const id = data.id || nextId("M", prev);
      const member: Member = {
        id,
        nom: data.nom,
        email: data.email,
        avatar: initials(data.nom),
        statut: data.statut,
        niveau: data.niveau ?? 0,
        badgeInvestisseur: data.badgeInvestisseur ?? data.capitalInvesti >= params.seuilInvestisseurFcfa,
        roleId: data.roleId,
        fonctions: data.fonctions ?? [],
        cotisation: data.cotisation,
        capitalInvesti: data.capitalInvesti,
        adhesion: data.adhesion,
        groupes: data.groupes ?? [],
        nbPresences: data.nbPresences ?? 0,
        nbAbsences: data.nbAbsences ?? 0,
        consecutives: data.consecutives ?? 0,
        enRecuperation: data.enRecuperation ?? false,
        grantScreens: data.grantScreens ?? [],
        denyScreens: data.denyScreens ?? [],
      };
      return [...prev, member];
    });
  }, [params.seuilInvestisseurFcfa]);

  const updateMember = useCallback((id: string, patch: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const next = { ...m, ...patch };
        if (patch.nom) next.avatar = initials(patch.nom);
        if (patch.capitalInvesti !== undefined) {
          next.badgeInvestisseur = patch.capitalInvesti >= params.seuilInvestisseurFcfa;
        }
        return next;
      }),
    );
  }, [params.seuilInvestisseurFcfa]);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.id !== id)));
    setCurrentUserId((cur) => (cur === id ? "M-0001" : cur));
  }, []);

  const updateRoleScreens = useCallback((roleId: string, screens: ScreenKey[]) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, screens } : r)));
  }, []);

  const addRole = useCallback((role: Omit<Role, "id"> & { id?: string }) => {
    const id = role.id || `role-${Date.now()}`;
    setRoles((prev) => [...prev, { ...role, id, screens: role.screens ?? ["accueil", "mon-espace"] }]);
  }, []);

  const updateParams = useCallback((patch: Partial<ProgressionParams>) => {
    setParams((p) => ({ ...p, ...patch, participationsParNiveau: { ...p.participationsParNiveau, ...(patch.participationsParNiveau ?? {}) } }));
  }, []);

  const recordParticipation: MembershipContextValue["recordParticipation"] = useCallback(
    ({ memberId, type, titre, present, date }) => {
      const when = date ?? new Date().toISOString().slice(0, 10);
      setParticipations((prev) => [
        { id: nextId("P", prev), memberId, date: when, type, titre, present },
        ...prev,
      ]);

      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== memberId) return m;
          if (m.statut === "invite" || m.statut === "suspendu" || m.statut === "confirme") {
            // Confirmé : on compte mais pas de rétrogradation
            if (m.statut === "confirme") {
              return present
                ? { ...m, nbPresences: m.nbPresences + 1, consecutives: m.consecutives + 1, nbAbsences: m.nbAbsences }
                : { ...m, nbAbsences: m.nbAbsences + 1, consecutives: 0 };
            }
            if (present) {
              return { ...m, nbPresences: m.nbPresences + 1, consecutives: m.consecutives + 1 };
            }
            return { ...m, nbAbsences: m.nbAbsences + 1, consecutives: 0 };
          }

          let next: Member = { ...m };
          const oldStatut = m.statut;
          const oldNiveau = m.niveau;

          if (present) {
            next.nbPresences += 1;
            next.consecutives += 1;

            // Récupération Simple → Actif
            if (next.statut === "simple" && next.enRecuperation && next.consecutives >= params.presencesPourRecuperation) {
              next.statut = "actif";
              next.niveau = Math.max(1, niveauFromPresences(next.nbPresences, params));
              next.enRecuperation = false;
              pushHistory({
                memberId,
                date: when,
                ancienStatut: oldStatut,
                nouveauStatut: next.statut,
                ancienNiveau: oldNiveau,
                nouveauNiveau: next.niveau,
                motif: `${params.presencesPourRecuperation} présences consécutives — récupération Actif`,
                type: "recuperation",
              });
            } else if (next.statut === "simple" && next.nbPresences >= params.participationsParNiveau[1]) {
              next.statut = "actif";
              next.niveau = niveauFromPresences(next.nbPresences, params);
              pushHistory({
                memberId,
                date: when,
                ancienStatut: oldStatut,
                nouveauStatut: "actif",
                ancienNiveau: oldNiveau,
                nouveauNiveau: next.niveau,
                motif: "Participations éligibles — passage Membre Actif",
                type: "montee_niveau",
              });
            } else if (next.statut === "actif") {
              const newNiveau = niveauFromPresences(next.nbPresences, params);
              if (newNiveau > next.niveau) {
                pushHistory({
                  memberId,
                  date: when,
                  ancienStatut: "actif",
                  nouveauStatut: "actif",
                  ancienNiveau: next.niveau,
                  nouveauNiveau: newNiveau,
                  motif: `Seuil N${newNiveau} atteint (${params.participationsParNiveau[newNiveau as 1|2|3|4|5]} participations)`,
                  type: "montee_niveau",
                });
                next.niveau = newNiveau;
              }
              if (next.nbPresences >= params.participationsPourConfirme) {
                pushHistory({
                  memberId,
                  date: when,
                  ancienStatut: "actif",
                  nouveauStatut: "confirme",
                  ancienNiveau: next.niveau,
                  nouveauNiveau: next.niveau,
                  motif: `≥ ${params.participationsPourConfirme} participations — Membre Confirmé (permanent)`,
                  type: "confirmation",
                });
                next.statut = "confirme";
              }
            }
          } else {
            next.nbAbsences += 1;
            next.consecutives = 0;
            if (next.statut === "actif" && next.nbAbsences >= params.absencesAvantRetrogradation) {
              pushHistory({
                memberId,
                date: when,
                ancienStatut: "actif",
                nouveauStatut: "simple",
                ancienNiveau: next.niveau,
                nouveauNiveau: 0,
                motif: `${params.absencesAvantRetrogradation}e absence — rétrogradation en Membre Simple`,
                type: "retrogradation",
              });
              next.statut = "simple";
              next.niveau = 0;
              next.enRecuperation = true;
              next.nbAbsences = 0;
            }
          }

          // Badge investisseur
          const wasInvest = m.badgeInvestisseur;
          next.badgeInvestisseur = next.capitalInvesti >= params.seuilInvestisseurFcfa;
          if (!wasInvest && next.badgeInvestisseur) {
            pushHistory({
              memberId,
              date: when,
              ancienStatut: next.statut,
              nouveauStatut: next.statut,
              ancienNiveau: next.niveau,
              nouveauNiveau: next.niveau,
              motif: `Capital ≥ ${params.seuilInvestisseurFcfa.toLocaleString("fr-FR")} FCFA`,
              type: "badge_investisseur",
            });
          }

          return next;
        }),
      );
    },
    [params, pushHistory],
  );

  const nominateFonction: MembershipContextValue["nominateFonction"] = useCallback(
    (memberId, data) => {
      const m = members.find((x) => x.id === memberId);
      if (!m) return "Membre introuvable";
      if (m.statut !== "actif" && m.statut !== "confirme") return "Statut insuffisant (Actif ou Confirmé requis)";
      if (m.niveau < params.niveauMinGouvernance && m.statut !== "confirme") {
        return `Niveau minimum N${params.niveauMinGouvernance} requis`;
      }
      if (data.type === "president_pole") {
        // maquette : on accepte, message informatif seulement
      }
      const fonction: FonctionGouvernance = {
        id: `fg-${Date.now()}`,
        ...data,
        active: true,
      };
      setMembers((prev) =>
        prev.map((mem) => (mem.id === memberId ? { ...mem, fonctions: [...mem.fonctions, fonction] } : mem)),
      );
      return null;
    },
    [members, params.niveauMinGouvernance],
  );

  const endFonction = useCallback((memberId: string, fonctionId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, fonctions: m.fonctions.map((f) => (f.id === fonctionId ? { ...f, active: false } : f)) }
          : m,
      ),
    );
  }, []);

  const toggleSessionInscription: MembershipContextValue["toggleSessionInscription"] = useCallback(
    (sessionId, memberId) => {
      const m = members.find((x) => x.id === memberId);
      if (!m?.badgeInvestisseur) return "Session réservée aux Membres Investisseurs (≥ 500 000 FCFA)";
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const has = s.inscrits.includes(memberId);
          if (!has && s.inscrits.length >= s.places) return s;
          return {
            ...s,
            inscrits: has ? s.inscrits.filter((id) => id !== memberId) : [...s.inscrits, memberId],
          };
        }),
      );
      return null;
    },
    [members],
  );

  const progressionVersSuivant = useCallback(
    (m: Member) => {
      if (m.statut === "confirme") return { current: m.nbPresences, target: m.nbPresences, pct: 100, label: "Statut permanent" };
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
      members, roles, params, participations, history, sessions,
      currentUserId, currentUser, currentRole, effectiveScreens, canAccess,
      setCurrentUserId, addMember, updateMember, removeMember,
      updateRoleScreens, addRole, updateParams, recordParticipation,
      nominateFonction, endFonction, toggleSessionInscription,
      screenLabel, progressionVersSuivant,
    }),
    [
      members, roles, params, participations, history, sessions,
      currentUserId, currentUser, currentRole, effectiveScreens, canAccess,
      addMember, updateMember, removeMember, updateRoleScreens, addRole,
      updateParams, recordParticipation, nominateFonction, endFonction,
      toggleSessionInscription, screenLabel, progressionVersSuivant,
    ],
  );

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembership() {
  const ctx = useContext(MembershipContext);
  if (!ctx) throw new Error("useMembership must be used within MembershipProvider");
  return ctx;
}

export type { FonctionType };
