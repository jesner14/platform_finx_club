import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeVersion = "v1" | "v2";

const STORAGE_KEY = "finx-theme-version";

export interface BrandPalette {
  navy: string;
  accent: string;
  premium: string;
  muted: string;
  card: string;
  border: string;
  chartStroke: string;
  chartFill: string;
  grid: string;
  allocation: string[];
}

const PALETTES: Record<ThemeVersion, BrandPalette> = {
  v1: {
    navy: "#0B1B59",
    accent: "#01AAE4",
    premium: "#F5D251",
    muted: "#8FA3C8",
    card: "#0B1B59",
    border: "rgba(1,170,228,0.22)",
    chartStroke: "#01AAE4",
    chartFill: "#01AAE4",
    grid: "rgba(255,255,255,0.06)",
    allocation: ["#01AAE4", "#0B1B59", "#F5D251", "#4DB8E8", "#8FA3C8"],
  },
  v2: {
    navy: "#0B1B59",
    accent: "#0B1B59",
    premium: "#F5D251",
    muted: "#5A6B8C",
    card: "#FFFFFF",
    border: "rgba(11,27,89,0.12)",
    chartStroke: "#0B1B59",
    chartFill: "#0B1B59",
    grid: "rgba(11,27,89,0.08)",
    allocation: ["#0B1B59", "#F5D251", "#01AAE4", "#3D4F8C", "#C5CDD9"],
  },
};

interface ThemeContextValue {
  theme: ThemeVersion;
  setTheme: (t: ThemeVersion) => void;
  brand: BrandPalette;
  isV2: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): ThemeVersion {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "v1" || v === "v2") return v;
  } catch {
    /* ignore */
  }
  // Fonctionnalité membres : V2 (bleu / blanc / jaune) par défaut
  return "v2";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVersion>(() =>
    typeof window !== "undefined" ? readStored() : "v2",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((t: ThemeVersion) => setThemeState(t), []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      brand: PALETTES[theme],
      isV2: theme === "v2",
    }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
