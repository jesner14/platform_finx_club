import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, X, Bell, Search, LogOut, Lock } from "lucide-react";
import { MembershipProvider, useMembership } from "./membership/MembershipContext";
import { LoginPage, ForceChangePasswordPage } from "./auth/LoginPage";
import { PublicSite } from "./public/PublicSite";
import { RegisterPage } from "./public/RegisterPage";
import { readPublicPage, type PublicPage } from "./public/publicNav";
import { AuthProvider, initialsFromName, roleLabel, useAuth } from "./auth/AuthContext";
import {
  NAV_ICONS,
  PageAccueil,
  PageDepots,
  PageGouvernance,
  PageMembres,
  PageMonEspace,
  PageParametres,
  PageParticipations,
  PageRoles,
  PageSessions,
  PageRetraits,
  PageSoldesParts,
  PageEtatsParts,
  PagePortefeuille,
  PageHistoriquePerformances,
  PageHistoriqueMontantsInvestis,
  PageHistoriqueCapitauxNets,
  PageValeursLiquidatives,
} from "./membership/FeaturePages";
import { PageInscription } from "./membership/InscriptionPage";
import { ADMIN_NAV_GROUPS, ADMIN_SCREEN_KEYS, ALL_SCREENS, MEMBER_SUBMENUS, type ScreenKey } from "./membership/types";
import { ModeToggle, ThemeProvider, useTheme } from "./theme/ThemeContext";
import { PageLoader, PillTabs, SavingOverlay } from "./membership/ui";

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
  const { canAccess } = useMembership();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const groups = ["Principal", "Gestion", "Membre", "Admin"];
  const avatar = initialsFromName(user?.nom ?? "SA");
  const [membersOpen, setMembersOpen] = useState(false);
  const memberChildActive = MEMBER_SUBMENUS.some((item) => item.key === active);

  useEffect(() => {
    if (active === "membres" || memberChildActive) setMembersOpen(true);
  }, [active, memberChildActive]);

  return (
    <aside className={`finx-sidebar fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col z-30 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      <div className={`relative flex items-center gap-2.5 px-3 h-16 border-b border-sidebar-border shrink-0 ${collapsed ? "justify-center px-2" : ""}`}>
        <button onClick={collapsed ? onToggle : undefined} className="shrink-0" type="button">
          <img src="/symbol-finx.png" alt="FINX Club" className="w-9 h-9 rounded-lg object-cover" />
        </button>
        {!collapsed && (
          <>
            <img src={isDark ? "/logo-finx-white.png" : "/logo-finx.png"} alt="FINX CLUB" className="h-8 w-auto object-contain flex-1 min-w-0" />
            <button onClick={onToggle} className="text-sidebar-foreground/60 hover:text-sidebar-foreground shrink-0" type="button">
              <X size={14} />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {groups.map((group) => {
          if (group === "Admin") {
            const adminGroups = ADMIN_NAV_GROUPS.filter((item) => item.tabs.some((tab) => canAccess(tab.key)));
            if (!adminGroups.length) return null;
            return (
              <div key={group} className="mb-2">
                {!collapsed && (
                  <p className="px-4 mb-1 font-mono text-[9px] tracking-[0.2em] text-sidebar-foreground/40 uppercase">{group}</p>
                )}
                {adminGroups.map((item) => {
                  const accessible = item.tabs.filter((tab) => canAccess(tab.key));
                  const Icon = NAV_ICONS[item.icon];
                  const isActive = accessible.some((tab) => tab.key === active);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onChange(accessible[0].key)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                        isActive
                          ? "finx-nav-active bg-sidebar-accent text-sidebar-primary border-r-2 border-sidebar-primary font-semibold"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={16} className="shrink-0" />
                      {!collapsed && <span className="font-medium flex-1 text-left">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            );
          }
          const items = ALL_SCREENS.filter((i) => i.group === group && !i.parent && canAccess(i.key));
          if (!items.length) return null;
          return (
            <div key={group} className="mb-2">
              {!collapsed && (
                <p className="px-4 mb-1 font-mono text-[9px] tracking-[0.2em] text-sidebar-foreground/40 uppercase">{group}</p>
              )}
              {items.map((item) => {
                const Icon = NAV_ICONS[item.key];
                const children = item.key === "membres"
                  ? [
                      { key: "membres" as ScreenKey, label: "Rechercher" },
                      ...MEMBER_SUBMENUS.filter((child) => canAccess(child.key)),
                    ]
                  : [];
                const isGroup = item.key === "membres" && children.length > 0;
                const childActive = children.some((child) => child.key === active);
                const isActive = isGroup ? childActive : active === item.key;
                return (
                  <div key={item.key}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isGroup) {
                          setMembersOpen((open) => !open);
                          return;
                        }
                        onChange(item.key);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                        isActive
                          ? "finx-nav-active bg-sidebar-accent text-sidebar-primary border-r-2 border-sidebar-primary font-semibold"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={16} className="shrink-0" />
                      {!collapsed && <span className="font-medium flex-1 text-left">{item.label}</span>}
                      {!collapsed && children.length > 0 && (
                        <ChevronDown size={14} className={`shrink-0 opacity-70 transition-transform ${membersOpen ? "" : "-rotate-90"}`} />
                      )}
                    </button>
                    {children.length > 0 && (collapsed || membersOpen) && (
                      <div className={collapsed ? "" : "ml-4 border-l border-sidebar-border/70 mb-1"}>
                        {children.map((child) => {
                          const ChildIcon = child.key === "membres" ? Search : NAV_ICONS[child.key];
                          const childIsActive = active === child.key;
                          return (
                            <button
                              key={`${item.key}-${child.key}`}
                              type="button"
                              onClick={() => onChange(child.key)}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] transition-all ${
                                childIsActive
                                  ? "finx-nav-active bg-sidebar-accent text-sidebar-primary font-semibold"
                                  : "text-sidebar-foreground/55 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                              } ${collapsed ? "justify-center" : ""}`}
                              title={collapsed ? child.label : undefined}
                            >
                              <ChildIcon size={14} className="shrink-0" />
                              {!collapsed && <span>{child.label}</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={`border-t border-sidebar-border p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-mono text-xs">
            {avatar}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-mono text-xs shrink-0">
              {avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.nom}</p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">{roleLabel(user?.role ?? "")}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground shrink-0"
              title="Se déconnecter"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function Topbar({ title, collapsed }: { title: string; collapsed: boolean }) {
  return (
    <header className={`finx-topbar fixed top-0 right-0 h-16 bg-background/90 backdrop-blur border-b border-border flex items-center px-6 gap-4 z-20 transition-all duration-300 ${collapsed ? "left-16" : "left-60"}`}>
      <h1 className="font-display text-lg font-bold text-foreground uppercase tracking-wide flex-1">{title}</h1>
      <ModeToggle />
      <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded px-3 py-1.5">
        <Search size={13} className="text-muted-foreground" />
        <input placeholder="Rechercher…" className="bg-transparent text-xs focus:outline-none w-36 font-mono" />
      </div>
      <button className="relative text-muted-foreground hover:text-foreground">
        <Bell size={18} />
      </button>
    </header>
  );
}

function AdminScreenTabs({
  active,
  onChange,
  canAccess,
}: {
  active: Section;
  onChange: (s: Section) => void;
  canAccess: (s: Section) => boolean;
}) {
  const group = ADMIN_NAV_GROUPS.find((item) => item.tabs.some((tab) => tab.key === active));
  if (!group) return null;
  const tabs = group.tabs.filter((tab) => canAccess(tab.key));
  return (
    <div className="mb-6">
      <div className="flex items-end gap-6 overflow-x-auto border-b border-border mb-4">
        {ADMIN_NAV_GROUPS.filter((item) => item.tabs.some((tab) => canAccess(tab.key))).map((item) => {
          const selected = item.id === group.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.tabs.find((tab) => canAccess(tab.key))!.key)}
              className={`relative shrink-0 pb-3 text-sm font-medium tracking-wide transition-colors ${
                selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {selected && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
      <PillTabs
        tabs={tabs.map((tab) => ({ id: tab.key, label: tab.label }))}
        active={active}
        onChange={(id) => onChange(id as Section)}
      />
    </div>
  );
}

function PageAccesRefuse({ screen }: { screen: Section }) {
  const { currentUser, currentRole } = useMembership();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
        <Lock size={22} className="text-red-600" />
      </div>
      <h2 className="font-display text-2xl font-bold uppercase text-foreground">Accès restreint</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        <span className="text-primary font-mono">{screen}</span> non autorisé pour {currentUser.nom} ({currentRole.label}).
      </p>
    </div>
  );
}

function AppShell() {
  const [section, setSection] = useState<Section>("accueil");
  const [collapsed, setCollapsed] = useState(false);
  const { canAccess, effectiveScreens, loading, saving, error, reload } = useMembership();
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
      case "inscription": return <PageInscription />;
      case "roles": return <PageRoles />;
      case "gouvernance": return <PageGouvernance />;
      case "participations": return <PageParticipations />;
      case "sessions": return <PageSessions />;
      case "mon-espace": return <PageMonEspace />;
      case "parametres": return <PageParametres />;
      case "depots": return <PageDepots />;
      case "retraits": return <PageRetraits />;
      case "solde-parts": return <PageSoldesParts />;
      case "etat-parts": return <PageEtatsParts />;
      case "valeur-portefeuille": return <PagePortefeuille />;
      case "historique-performances": return <PageHistoriquePerformances />;
      case "historique-montants-investis": return <PageHistoriqueMontantsInvestis />;
      case "historique-capitaux-nets": return <PageHistoriqueCapitauxNets />;
      case "valeur-liquidative": return <PageValeursLiquidatives />;
    }
  };

  return (
    <div className="finx-app min-h-screen bg-background font-sans" style={{ fontFamily: "'Arimo', system-ui, sans-serif" }}>
      <Sidebar active={section} onChange={go} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <Topbar title={SECTION_TITLES[section]} collapsed={collapsed} />
      <main className="pt-16 min-h-screen transition-all duration-300" style={{ paddingLeft: collapsed ? "4rem" : "15rem" }}>
        <div className="p-8 max-w-7xl mx-auto">
          {loading ? (
            <PageLoader label="Chargement des données…" />
          ) : (
            <>
              {ADMIN_SCREEN_KEYS.includes(section) && (
                <AdminScreenTabs active={section} onChange={go} canAccess={canAccess} />
              )}
              {error && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-2">
                  <p className="text-xs text-red-700">{error}</p>
                  <button type="button" onClick={() => void reload()} className="text-xs font-medium text-red-700 underline">
                    Réessayer
                  </button>
                </div>
              )}
              {renderPage()}
            </>
          )}
        </div>
      </main>
      <SavingOverlay show={saving} />
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
      <AuthProvider>
        <MembershipProvider>
          <Root />
        </MembershipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function PublicGate() {
  const [page, setPage] = useState<PublicPage>(() =>
    typeof window !== "undefined" ? readPublicPage() : "home",
  );

  useEffect(() => {
    const sync = () => setPage(readPublicPage());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  if (page === "login") return <LoginPage />;
  if (page === "register") return <RegisterPage />;
  return <PublicSite />;
}

function Root() {
  const { isAuthenticated, mustChangePassword } = useAuth();
  return (
    <>
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
      {isAuthenticated
        ? (mustChangePassword ? <ForceChangePasswordPage /> : <AppShell />)
        : <PublicGate />}
    </>
  );
}
