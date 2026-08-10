import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { INITIAL_MEMBERS, INITIAL_ROLES } from "./seed";
import type { Member, Role, ScreenKey } from "./types";
import { ALL_SCREENS } from "./types";

interface MembershipContextValue {
  members: Member[];
  roles: Role[];
  currentUserId: string;
  currentUser: Member;
  currentRole: Role;
  effectiveScreens: ScreenKey[];
  canAccess: (screen: ScreenKey) => boolean;
  setCurrentUserId: (id: string) => void;
  addMember: (data: Omit<Member, "id" | "avatar"> & { id?: string }) => Member;
  updateMember: (id: string, patch: Partial<Member>) => void;
  removeMember: (id: string) => void;
  updateRoleScreens: (roleId: string, screens: ScreenKey[]) => void;
  addRole: (role: Omit<Role, "id"> & { id?: string }) => Role;
  screenLabel: (key: ScreenKey) => string;
}

const MembershipContext = createContext<MembershipContextValue | null>(null);

function initials(nom: string) {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function nextMemberId(members: Member[]) {
  const nums = members.map((m) => parseInt(m.id.replace(/\D/g, ""), 10)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `M-${String(max + 1).padStart(4, "0")}`;
}

export function computeEffectiveScreens(member: Member, roles: Role[]): ScreenKey[] {
  const role = roles.find((r) => r.id === member.roleId);
  const base = new Set<ScreenKey>(role?.screens ?? ["accueil", "mon-espace"]);
  for (const s of member.grantScreens) base.add(s);
  for (const s of member.denyScreens) base.delete(s);
  // Suspendu : accès minimal
  if (member.statut === "suspendu") {
    return ["accueil", "mon-espace"].filter((s) => base.has(s as ScreenKey)) as ScreenKey[];
  }
  return ALL_SCREENS.map((s) => s.key).filter((k) => base.has(k));
}

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
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

  const addMember: MembershipContextValue["addMember"] = useCallback((data) => {
    let created!: Member;
    setMembers((prev) => {
      const id = data.id || nextMemberId(prev);
      created = {
        id,
        nom: data.nom,
        email: data.email,
        avatar: initials(data.nom) || "XX",
        statut: data.statut,
        niveau: data.niveau,
        badgeInvestisseur: data.badgeInvestisseur,
        roleId: data.roleId,
        fonctions: data.fonctions ?? [],
        cotisation: data.cotisation,
        capital: data.capital,
        adhesion: data.adhesion,
        grantScreens: data.grantScreens ?? [],
        denyScreens: data.denyScreens ?? [],
      };
      return [...prev, created];
    });
    return created;
  }, []);

  const updateMember = useCallback((id: string, patch: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const next = { ...m, ...patch };
        if (patch.nom) next.avatar = initials(patch.nom);
        return next;
      }),
    );
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((m) => m.id !== id);
    });
    setCurrentUserId((cur) => (cur === id ? "M-0001" : cur));
  }, []);

  const updateRoleScreens = useCallback((roleId: string, screens: ScreenKey[]) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, screens } : r)));
  }, []);

  const addRole: MembershipContextValue["addRole"] = useCallback((role) => {
    const id = role.id || `role-${Date.now()}`;
    const created: Role = { ...role, id, screens: role.screens ?? ["accueil", "mon-espace"] };
    setRoles((prev) => [...prev, created]);
    return created;
  }, []);

  const screenLabel = useCallback(
    (key: ScreenKey) => ALL_SCREENS.find((s) => s.key === key)?.label ?? key,
    [],
  );

  const value = useMemo(
    () => ({
      members,
      roles,
      currentUserId,
      currentUser,
      currentRole,
      effectiveScreens,
      canAccess,
      setCurrentUserId,
      addMember,
      updateMember,
      removeMember,
      updateRoleScreens,
      addRole,
      screenLabel,
    }),
    [
      members,
      roles,
      currentUserId,
      currentUser,
      currentRole,
      effectiveScreens,
      canAccess,
      addMember,
      updateMember,
      removeMember,
      updateRoleScreens,
      addRole,
      screenLabel,
    ],
  );

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembership() {
  const ctx = useContext(MembershipContext);
  if (!ctx) throw new Error("useMembership must be used within MembershipProvider");
  return ctx;
}
