import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";

export type ColorMode = "light" | "dark";

const STORAGE_KEY = "finx-color-mode";

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

const LIGHT_BRAND: BrandPalette = {
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
};

const DARK_BRAND: BrandPalette = {
  navy: "#F4F6FA",
  accent: "#F5D251",
  premium: "#F5D251",
  muted: "#9AABC8",
  card: "#141C3A",
  border: "rgba(255,255,255,0.08)",
  chartStroke: "#F5D251",
  chartFill: "#F5D251",
  grid: "rgba(255,255,255,0.08)",
  allocation: ["#F5D251", "#01AAE4", "#8FA3C8", "#F4F6FA", "#3D4F8C"],
};

interface ThemeContextValue {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  isDark: boolean;
  brand: BrandPalette;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): ColorMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    /* ignore */
  }
  return "light";
}

function applyMode(mode: ColorMode) {
  const root = document.documentElement;
  root.setAttribute("data-mode", mode);
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(() => {
    const next = typeof window !== "undefined" ? readStored() : "light";
    if (typeof document !== "undefined") applyMode(next);
    return next;
  });

  useEffect(() => {
    applyMode(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const setMode = useCallback((next: ColorMode) => setModeState(next), []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      isDark: mode === "dark",
      brand: mode === "dark" ? DARK_BRAND : LIGHT_BRAND,
    }),
    [mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ModeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-secondary/60">
      <button
        type="button"
        onClick={() => setMode("light")}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider ${
          mode === "light" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Sun size={12} />
        Clair
      </button>
      <button
        type="button"
        onClick={() => setMode("dark")}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider ${
          mode === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Moon size={12} />
        Sombre
      </button>
    </div>
  );
}
