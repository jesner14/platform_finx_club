import { useEffect, useState } from "react";
import { ChevronRight, X, Bell, Search, LogOut, Lock } from "lucide-react";
import { MembershipProvider, useMembership } from "./membership/MembershipContext";
import {
  NAV_ICONS,
  PageAccueil,
  PageGouvernance,
  PageMembres,
  PageMonEspace,
  PageParametres,
  PageParticipations,
  PageRoles,
  PageSessions,
} from "./membership/FeaturePages";
import { ALL_SCREENS, type ScreenKey } from "./membership/types";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";

type Section = ScreenKey;

const SECTION_TITLES: Record<Section, string> = Object.fromEntries(
  ALL_SCREENS.map((s) => [s.key, s.label]),
) as Record<Section, string>;

function Sidebar({
  active,
  onChange,
  collapsed,
  onToggle,
}: {
  active: Section;
  onChange: (s: Section) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { currentUser, currentRole, canAccess, members, setCurrentUserId } = useMembership();
  const groups = ["Principal", "Gestion", "Suivi", "Membre", "Admin"];

  return (
    <aside className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col z-30 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      <div className={`relative flex items-center gap-2.5 px-3 h-16 border-b border-sidebar-border shrink-0 ${collapsed ? "justify-center px-2" : ""}`}>
        <button onClick={collapsed ? onToggle : undefined} className="shrink-0" type="button">
          <img src="/symbol-finx.png" alt="FINX Club" className="w-9 h-9 rounded-lg object-cover" />
        </button>
        {!collapsed && (
          <>
            <img src="/logo-finx-white.png" alt="FINX CLUB" className="h-8 w-auto object-contain flex-1 min-w-0" />
            <button onClick={onToggle} className="text-sidebar-foreground/60 hover:text-sidebar-foreground shrink-0" type="button">
              <X size={14} />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {groups.map((group) => {
          const items = ALL_SCREENS.filter((i) => i.group === group && canAccess(i.key));
          if (!items.length) return null;
          return (
            <div key={group} className="mb-2">
              {!collapsed && (
                <p className="px-4 mb-1 font-mono text-[9px] tracking-[0.2em] text-sidebar-foreground/40 uppercase">{group}</p>
              )}
              {items.map((item) => {
                const Icon = NAV_ICONS[item.key];
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onChange(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary border-r-2 border-sidebar-primary"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={`border-t border-sidebar-border p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-mono text-xs">
            {currentUser.avatar}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-mono text-xs shrink-0">
                {currentUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{currentUser.nom}</p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate">{currentRole.label}</p>
              </div>
              <LogOut size={13} className="text-sidebar-foreground/50" />
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="finx-select w-full bg-white border border-sidebar-border rounded px-2 py-1.5 text-[10px] font-mono text-[#0B1B59] focus:outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-white text-[#0B1B59]">
                  {m.nom}
                </option>
              ))}
            </select>
            <p className="font-mono text-[9px] text-sidebar-foreground/50 leading-tight">
              Basculer d'identité pour tester les accès
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function Topbar({ title, collapsed }: { title: string; collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  return (
    <header className={`fixed top-0 right-0 h-16 bg-background/90 backdrop-blur border-b border-border flex items-center px-6 gap-4 z-20 transition-all duration-300 ${collapsed ? "left-16" : "left-60"}`}>
      <h1 className="font-display text-lg font-bold text-foreground uppercase tracking-wide flex-1">{title}</h1>
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-secondary/60">
        {(["v1", "v2"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setTheme(v)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider ${
              theme === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded px-3 py-1.5">
        <Search size={13} className="text-muted-foreground" />
        <input placeholder="Rechercher…" className="bg-transparent text-xs focus:outline-none w-36 font-mono" />
      </div>
      <button className="relative text-muted-foreground hover:text-foreground">
        <Bell size={18} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[9px] font-bold text-primary-foreground flex items-center justify-center">2</span>
      </button>
    </header>
  );
}

function PageAccesRefuse({ screen }: { screen: Section }) {
  const { currentUser, currentRole, members, setCurrentUserId } = useMembership();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
        <Lock size={22} className="text-red-600" />
      </div>
      <h2 className="font-display text-2xl font-bold uppercase text-foreground">Accès restreint</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        <span className="text-primary font-mono">{screen}</span> non autorisé pour {currentUser.nom} ({currentRole.label}).
      </p>
      <select
        className="finx-select bg-white border border-border rounded px-3 py-2 text-xs font-mono text-[#0B1B59]"
        value={currentUser.id}
        onChange={(e) => setCurrentUserId(e.target.value)}
      >
        {members.map((m) => (
          <option key={m.id} value={m.id} className="bg-white text-[#0B1B59]">
            {m.nom}
          </option>
        ))}
      </select>
    </div>
  );
}

function AppShell() {
  const [section, setSection] = useState<Section>("accueil");
  const [collapsed, setCollapsed] = useState(false);
  const { canAccess, effectiveScreens } = useMembership();

  useEffect(() => {
    if (!canAccess(section)) {
      setSection(effectiveScreens.includes("accueil") ? "accueil" : effectiveScreens[0] ?? "accueil");
    }
  }, [canAccess, section, effectiveScreens]);

  const go = (s: Section) => {
    if (canAccess(s)) setSection(s);
  };

  const renderPage = () => {
    if (!canAccess(section)) return <PageAccesRefuse screen={section} />;
    switch (section) {
      case "accueil": return <PageAccueil />;
      case "membres": return <PageMembres />;
      case "roles": return <PageRoles />;
      case "gouvernance": return <PageGouvernance />;
      case "participations": return <PageParticipations />;
      case "sessions": return <PageSessions />;
      case "mon-espace": return <PageMonEspace />;
      case "parametres": return <PageParametres />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans" style={{ fontFamily: "'Arimo', system-ui, sans-serif" }}>
      <style>{`
        .font-display { font-family: 'Barlow', 'Arimo', sans-serif; }
        .font-mono { font-family: 'Arimo', ui-monospace, monospace; letter-spacing: 0.02em; }
        .finx-select,
        .finx-select option,
        select option {
          color: #0B1B59 !important;
          background-color: #ffffff !important;
        }
      `}</style>
      <Sidebar active={section} onChange={go} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <Topbar title={SECTION_TITLES[section]} collapsed={collapsed} />
      <main className="pt-16 min-h-screen transition-all duration-300" style={{ paddingLeft: collapsed ? "4rem" : "15rem" }}>
        <div className="p-6 max-w-7xl mx-auto">{renderPage()}</div>
      </main>
      {!collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="fixed bottom-4 left-[13.5rem] z-40 p-1 rounded border border-sidebar-border bg-sidebar text-sidebar-foreground/60 hidden"
        >
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MembershipProvider>
        <AppShell />
      </MembershipProvider>
    </ThemeProvider>
  );
}
