import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: number;
  email: string;
  nom: string;
  role: string;
  mustChangePassword?: boolean;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
  patchUser: (patch: Partial<Pick<AuthUser, "email" | "nom" | "mustChangePassword">>) => void;
}

const TOKEN_KEY = "finx-token";
const REFRESH_KEY = "finx-refresh-token";
const USER_KEY = "finx-auth-user";
const ACCESS_EXP_KEY = "finx-access-exp";
const SESSION_EXP_KEY = "finx-session-exp";

const AuthContext = createContext<AuthContextValue | null>(null);

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readNumber(key: string): number | null {
  const raw = readString(key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readString(TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => readString(REFRESH_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => readJson<AuthUser>(USER_KEY));
  const [accessExpiresAt, setAccessExpiresAt] = useState<number | null>(() => readNumber(ACCESS_EXP_KEY));
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(() => readNumber(SESSION_EXP_KEY));
  const refreshTokenRef = useRef(refreshToken);
  refreshTokenRef.current = refreshToken;
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const persist = useCallback((
    nextToken: string | null,
    nextRefresh: string | null,
    nextUser: AuthUser | null,
    accessExp: number | null,
    sessionExp: number | null,
  ) => {
    try {
      if (nextToken && nextRefresh && nextUser && accessExp && sessionExp) {
        localStorage.setItem(TOKEN_KEY, nextToken);
        localStorage.setItem(REFRESH_KEY, nextRefresh);
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        localStorage.setItem(ACCESS_EXP_KEY, String(accessExp));
        localStorage.setItem(SESSION_EXP_KEY, String(sessionExp));
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ACCESS_EXP_KEY);
        localStorage.removeItem(SESSION_EXP_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const applySession = useCallback((body: {
    token: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    user: AuthUser;
  }) => {
    const now = Date.now();
    const accessExp = now + body.expiresIn * 1000;
    const sessionExp = now + body.refreshExpiresIn * 1000;
    const nextUser: AuthUser = {
      ...body.user,
      mustChangePassword: Boolean(body.user?.mustChangePassword),
    };
    setToken(body.token);
    setRefreshToken(body.refreshToken);
    setUser(nextUser);
    setAccessExpiresAt(accessExp);
    setSessionExpiresAt(sessionExp);
    persist(body.token, body.refreshToken, nextUser, accessExp, sessionExp);
  }, [persist]);

  const clearSession = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setAccessExpiresAt(null);
    setSessionExpiresAt(null);
    persist(null, null, null, null, null);
  }, [persist]);

  const logout = useCallback(() => {
    const currentRefresh = refreshTokenRef.current;
    if (currentRefresh) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentRefresh }),
      }).catch(() => undefined);
    }
    clearSession();
  }, [clearSession]);

  const patchUser = useCallback((patch: Partial<Pick<AuthUser, "email" | "nom" | "mustChangePassword">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const refreshSession = useCallback(async () => {
    const currentRefresh = refreshTokenRef.current;
    if (!currentRefresh) {
      clearSession();
      return false;
    }
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentRefresh }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        clearSession();
        return false;
      }
      applySession(body);
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [applySession, clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        return (body?.message as string) || "Identifiant ou mot de passe incorrect.";
      }
      applySession(body);
      return null;
    } catch {
      return "Impossible de joindre le serveur. Vérifiez que le back est lancé.";
    }
  }, [applySession]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const currentToken = tokenRef.current;
    if (!currentToken) return "Session expirée. Reconnectez-vous.";
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        return (body?.message as string) || "Impossible de changer le mot de passe.";
      }
      applySession(body);
      return null;
    } catch {
      return "Impossible de joindre le serveur. Vérifiez que le back est lancé.";
    }
  }, [applySession]);

  useEffect(() => {
    if (!sessionExpiresAt) return;
    const remaining = sessionExpiresAt - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }
    const timer = window.setTimeout(() => logout(), remaining);
    return () => window.clearTimeout(timer);
  }, [sessionExpiresAt, logout]);

  useEffect(() => {
    if (!token || !sessionExpiresAt) return;
    if (sessionExpiresAt <= Date.now()) {
      logout();
      return;
    }
    if (sessionExpiresAt - Date.now() <= 30_000) {
      return;
    }
    if (!accessExpiresAt) return;
    const delay = accessExpiresAt - 30_000 - Date.now();
    if (delay <= 0) {
      void refreshSession();
      return;
    }
    const timer = window.setTimeout(() => void refreshSession(), delay);
    return () => window.clearTimeout(timer);
  }, [token, accessExpiresAt, sessionExpiresAt, logout, refreshSession]);

  const mustChangePassword = Boolean(user?.mustChangePassword);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token && user && sessionExpiresAt && sessionExpiresAt > Date.now()),
      user,
      token,
      mustChangePassword,
      login,
      logout,
      changePassword,
      patchUser,
    }),
    [token, user, sessionExpiresAt, mustChangePassword, login, logout, changePassword, patchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function initialsFromName(nom: string) {
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "SA";
}

export function roleLabel(role: string) {
  if (role === "SUPER_ADMIN") return "Super Admin";
  return role;
}
