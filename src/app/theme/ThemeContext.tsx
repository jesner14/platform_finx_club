import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const THEME_VERSIONS = ["v1", "v2", "v3"] as const;
export type ThemeVersion = (typeof THEME_VERSIONS)[number];

const STORAGE_KEY = "finx-theme-version-r2";

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
  v2: {
    navy: "#0B1B59",
    accent: "#F5D251",
    premium: "#F5D251",
    muted: "#5A6B8C",
    card: "#FFFFFF",
    border: "rgba(11,27,89,0.08)",
    chartStroke: "#0B1B59",
    chartFill: "#F5D251",
    grid: "rgba(11,27,89,0.08)",
    allocation: ["#0B1B59", "#F5D251", "#01AAE4", "#3D4F8C", "#C5CDD9"],
  },
  v3: {
    navy: "#0B1B59",
    accent: "#FFFFFF",
    premium: "#F5D251",
    muted: "#5A6B8C",
    card: "rgba(255,255,255,0.62)",
    border: "rgba(255,255,255,0.7)",
    chartStroke: "#0B1B59",
    chartFill: "#01AAE4",
    grid: "rgba(11,27,89,0.08)",
    allocation: ["#0B1B59", "#FFFFFF", "#01AAE4", "#F5D251", "#3D4F8C"],
  },
};

interface ThemeContextValue {
  theme: ThemeVersion;
  setTheme: (t: ThemeVersion) => void;
  brand: BrandPalette;
  isV2: boolean;
  isV3: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): ThemeVersion {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "v1" || v === "v2" || v === "v3") return v;
  } catch {
    /* ignore */
  }
  return "v1";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVersion>(() =>
    typeof window !== "undefined" ? readStored() : "v1",
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
      isV3: theme === "v3",
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
