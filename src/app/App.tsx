import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  LayoutDashboard, Users, Calendar, BookOpen, TrendingUp,
  FileText, Settings, ChevronRight, X, Bell, Search,
  Download, Plus, Eye, Edit, Trash2, ArrowUpRight, ArrowDownRight,
  Globe, Award, Shield, Briefcase, Building2, UserCheck, LogOut,
  Star, MapPin, Clock,
  DollarSign, Target, PieChart as PieIcon, Activity, Lock,
  CheckCircle, AlertCircle, Info, Mail, Phone, ExternalLink,
  BarChart2, Upload, Folder, Share2, CreditCard, Layers, KeyRound
} from "lucide-react";
import { MembershipProvider, useMembership } from "./membership/MembershipContext";
import { PageMembresRoles } from "./membership/PageMembresRoles";
import type { ScreenKey } from "./membership/types";
import { STATUS_LABELS } from "./membership/types";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const STATS_HERO = [
  { label: "Membres actifs", value: "284", delta: "+12%", up: true },
  { label: "Capital géré", value: "4,7 Mds FCFA", delta: "+8.3%", up: true },
  { label: "Programmes actifs", value: "9", delta: "+2", up: true },
  { label: "Partenaires", value: "23", delta: "+5", up: true },
];

const PORTFOLIO_DATA = [
  { mois: "Jan", valeur: 3200, rendement: 3.2 },
  { mois: "Fév", valeur: 3450, rendement: 4.1 },
  { mois: "Mar", valeur: 3310, rendement: -2.8 },
  { mois: "Avr", valeur: 3620, rendement: 5.4 },
  { mois: "Mai", valeur: 3890, rendement: 6.1 },
  { mois: "Jun", valeur: 4050, rendement: 3.9 },
  { mois: "Jul", valeur: 4230, rendement: 4.5 },
  { mois: "Aoû", valeur: 4100, rendement: -2.1 },
  { mois: "Sep", valeur: 4380, rendement: 5.8 },
  { mois: "Oct", valeur: 4620, rendement: 7.2 },
  { mois: "Nov", valeur: 4550, rendement: -1.5 },
  { mois: "Déc", valeur: 4750, rendement: 4.8 },
];

const ALLOCATION_BASE = [
  { name: "Immobilier", value: 35 },
  { name: "Actions", value: 28 },
  { name: "Obligations", value: 18 },
  { name: "Startups", value: 12 },
  { name: "Liquidités", value: 7 },
];

const EVENTS = [
  { titre: "Assemblée Générale Ordinaire 2025", date: "15 Février 2025", heure: "09h00", lieu: "Hôtel Ivoire, Abidjan", type: "AG", statut: "Confirmé", inscrits: 184 },
  { titre: "Forum Investissement Afrique de l'Ouest", date: "28 Mars 2025", heure: "08h30", lieu: "Palais des Congrès, Abidjan", type: "Forum", statut: "Ouvert", inscrits: 67 },
  { titre: "Séminaire : Marchés obligataires UEMOA", date: "12 Avril 2025", heure: "14h00", lieu: "Siege FINX, Plateau", type: "Séminaire", statut: "Ouvert", inscrits: 23 },
  { titre: "Cérémonie d'intégration des nouveaux membres", date: "03 Mai 2025", heure: "11h00", lieu: "Siege FINX, Plateau", type: "Cérémonie", statut: "Planifié", inscrits: 0 },
  { titre: "Webinaire : Financement des PME en Côte d'Ivoire", date: "20 Mai 2025", heure: "17h30", lieu: "En ligne", type: "Webinaire", statut: "Ouvert", inscrits: 142 },
];

const PROGRAMS = [
  { code: "PGM-001", nom: "Fonds Immobilier Abidjan", categorie: "Immobilier", rendement: "8–12% / an", duree: "36 mois", min: "2 000 000 FCFA", statut: "Actif", souscripteurs: 48 },
  { code: "PGM-002", nom: "Portefeuille Actions BRVM", categorie: "Actions", rendement: "10–15% / an", duree: "24 mois", min: "500 000 FCFA", statut: "Actif", souscripteurs: 112 },
  { code: "PGM-003", nom: "Obligations d'État UEMOA", categorie: "Obligations", rendement: "6–8% / an", duree: "60 mois", min: "1 000 000 FCFA", statut: "Actif", souscripteurs: 73 },
  { code: "PGM-004", nom: "Fonds Startups Tech Afrique", categorie: "Capital-risque", rendement: "15–30% / an", duree: "48 mois", min: "5 000 000 FCFA", statut: "Actif", souscripteurs: 19 },
  { code: "PGM-005", nom: "SICAV Équilibrée FINX", categorie: "Mixte", rendement: "7–10% / an", duree: "12 mois", min: "250 000 FCFA", statut: "Actif", souscripteurs: 201 },
  { code: "PGM-006", nom: "Fonds Agriculture Durable", categorie: "Agriculture", rendement: "9–11% / an", duree: "30 mois", min: "1 500 000 FCFA", statut: "En lancement", souscripteurs: 0 },
];

const PARTNERS = [
  { nom: "Université Félix Houphouët-Boigny", type: "Académique", pays: "Côte d'Ivoire", depuis: "2022", domaine: "Finance & Gestion" },
  { nom: "ESCA Maroc – École de Management", type: "Académique", pays: "Maroc", depuis: "2023", domaine: "Investissement" },
  { nom: "BCEAO", type: "Institutionnel", pays: "Sénégal", depuis: "2021", domaine: "Régulation" },
  { nom: "Cabinet Deloitte CI", type: "Professionnel", pays: "Côte d'Ivoire", depuis: "2022", domaine: "Audit & Conseil" },
  { nom: "Orange Côte d'Ivoire", type: "Entreprise", pays: "Côte d'Ivoire", depuis: "2023", domaine: "Fintech" },
  { nom: "Banque Mondiale – IFC", type: "Institutionnel", pays: "International", depuis: "2024", domaine: "Financement" },
];

const DOCUMENTS = [
  { nom: "Statuts du GIE FINX CLUB", type: "Juridique", taille: "1.2 MB", date: "12 Jan 2021", acces: "Membres" },
  { nom: "Rapport Annuel 2024", type: "Rapport", taille: "4.8 MB", date: "31 Jan 2025", acces: "Membres" },
  { nom: "Notice d'Information PGM-001", type: "Programme", taille: "890 KB", date: "05 Mar 2024", acces: "Public" },
  { nom: "Procès-verbal AG 2024", type: "Juridique", taille: "650 KB", date: "20 Fév 2024", acces: "Membres" },
  { nom: "Charte des Membres", type: "Réglementaire", taille: "340 KB", date: "12 Jan 2021", acces: "Public" },
  { nom: "Tableau de bord Q4 2024", type: "Rapport", taille: "2.1 MB", date: "10 Jan 2025", acces: "Investisseurs" },
  { nom: "Convention de Partenariat – UFHB", type: "Partenariat", taille: "780 KB", date: "15 Sep 2023", acces: "Membres" },
];

const SUBSCRIPTIONS = [
  { ref: "SOS-2025-0034", membre: "Konan Kouassi É.", programme: "SICAV Équilibrée FINX", montant: "500 000 FCFA", date: "08 Jan 2025", statut: "Validé" },
  { ref: "SOS-2025-0033", membre: "Ibrahima Coulibaly", programme: "Portefeuille Actions BRVM", montant: "750 000 FCFA", date: "06 Jan 2025", statut: "En attente" },
  { ref: "SOS-2025-0032", membre: "Nadia Bamba Koné", programme: "Fonds Immobilier Abidjan", montant: "2 500 000 FCFA", date: "04 Jan 2025", statut: "Validé" },
  { ref: "SOS-2025-0031", membre: "Ama Diallo Fanta", programme: "Fonds Startups Tech", montant: "8 000 000 FCFA", date: "02 Jan 2025", statut: "Validé" },
  { ref: "SOS-2025-0030", membre: "Seydou Traoré", programme: "Obligations UEMOA", montant: "1 000 000 FCFA", date: "30 Déc 2024", statut: "Rejeté" },
];

const MY_INVESTMENTS = [
  { programme: "SICAV Équilibrée FINX", investi: "1 250 000", valeur: "1 387 500", rendement: "+11.0%", statut: "En cours" },
  { programme: "Fonds Immobilier Abidjan", investi: "5 000 000", valeur: "5 601 000", rendement: "+12.0%", statut: "En cours" },
  { programme: "Portefeuille Actions BRVM", investi: "2 000 000", valeur: "2 248 000", rendement: "+12.4%", statut: "En cours" },
];

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Section = ScreenKey;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" | "premium" }) {
  const styles: Record<string, string> = {
    default: "bg-primary/20 text-primary border border-primary/30",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    info: "bg-primary/15 text-primary border border-primary/25",
    neutral: "bg-white/10 text-foreground/60 border border-white/10",
    // Charte : or réservé aux éléments premium
    premium: "badge-premium bg-[#F5D251]/15 text-[#0B1B59] border border-[#0B1B59]/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    "Actif": "success", "Validé": "success", "Confirmé": "success",
    "En retard": "warning", "Ouvert": "info", "Planifié": "neutral", "En lancement": "info",
    "Suspendu": "danger", "Rejeté": "danger", "Impayée": "danger",
    "En attente": "warning", "En cours": "success",
  };
  return <Badge variant={(map[statut] || "neutral") as any}>{statut}</Badge>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <p className="font-mono text-xs text-primary tracking-[0.2em] uppercase mb-2">{label}</p>
      <h2 className="font-display text-3xl font-bold text-foreground uppercase tracking-wide">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-2 text-sm max-w-xl">{subtitle}</p>}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { key: Section; label: string; icon: React.ElementType; group?: string }[] = [
  { key: "accueil", label: "Tableau de bord", icon: LayoutDashboard, group: "Principal" },
  { key: "membres", label: "Membres", icon: Users, group: "Gestion" },
  { key: "roles", label: "Rôles & accès", icon: KeyRound, group: "Gestion" },
  { key: "evenements", label: "Événements", icon: Calendar, group: "Gestion" },
  { key: "programmes", label: "Programmes", icon: TrendingUp, group: "Gestion" },
  { key: "partenaires", label: "Partenariats", icon: Globe, group: "Gestion" },
  { key: "souscription", label: "Souscriptions", icon: CreditCard, group: "Gestion" },
  { key: "investissements", label: "Investissements", icon: BarChart2, group: "Suivi" },
  { key: "documents", label: "Documents", icon: FileText, group: "Suivi" },
  { key: "mon-espace", label: "Mon Espace", icon: UserCheck, group: "Membres" },
  { key: "backoffice", label: "Back-office", icon: Settings, group: "Admin" },
];

function Sidebar({ active, onChange, collapsed, onToggle }: {
  active: Section; onChange: (s: Section) => void; collapsed: boolean; onToggle: () => void;
}) {
  const { currentUser, currentRole, canAccess, members, setCurrentUserId } = useMembership();
  const groups = ["Principal", "Gestion", "Suivi", "Membres", "Admin"];
  return (
    <aside className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col z-30 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo — charte FINX Club */}
      <div className={`relative flex items-center gap-2.5 px-3 h-16 border-b border-sidebar-border shrink-0 ${collapsed ? "justify-center px-2" : ""}`}>
        <button onClick={collapsed ? onToggle : undefined} className="shrink-0" title="FINX Club" type="button">
          <img src="/symbol-finx.png" alt="FINX Club" className="w-9 h-9 rounded-lg object-cover" />
        </button>
        {!collapsed && (
          <>
            <img src="/logo-finx-white.png" alt="FINX CLUB" className="h-8 w-auto object-contain flex-1 min-w-0" />
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors shrink-0" type="button">
              <X size={14} />
            </button>
          </>
        )}
      </div>

      {/* Nav filtrée par droits */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {groups.map(group => {
          const items = NAV_ITEMS.filter(i => i.group === group && canAccess(i.key));
          if (!items.length) return null;
          return (
            <div key={group} className="mb-2">
              {!collapsed && (
                <p className="px-4 mb-1 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/50 uppercase">{group}</p>
              )}
              {items.map(item => {
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onChange(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${isActive
                      ? "bg-sidebar-accent text-sidebar-primary border-r-2 border-sidebar-primary"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={16} className="shrink-0" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Sélecteur d'identité (maquette) */}
      <div className={`border-t border-sidebar-border p-3 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-mono text-xs">{currentUser.avatar}</div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-mono text-xs shrink-0">{currentUser.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{currentUser.nom}</p>
                <p className="text-[10px] text-muted-foreground truncate">{currentRole.label}</p>
              </div>
              <LogOut size={13} className="text-muted-foreground" />
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-[10px] font-mono text-foreground focus:outline-none focus:border-primary/50"
              title="Simuler un autre membre"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
            <p className="font-mono text-[9px] text-muted-foreground/70 leading-tight">Basculer d'identité pour tester les restrictions d'écrans</p>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────

function Topbar({ title, collapsed }: { title: string; collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  return (
    <header className={`fixed top-0 right-0 h-16 bg-background/90 backdrop-blur border-b border-border flex items-center px-6 gap-4 z-20 transition-all duration-300 ${collapsed ? "left-16" : "left-60"}`}>
      <h1 className="font-display text-lg font-bold text-foreground uppercase tracking-wide flex-1">{title}</h1>
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-secondary/60" title="Comparer les thèmes">
        {(["v1", "v2"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setTheme(v)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors ${
              theme === v
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded px-3 py-1.5">
        <Search size={13} className="text-muted-foreground" />
        <input placeholder="Rechercher…" className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-40 font-mono" />
      </div>
      <button className="relative text-muted-foreground hover:text-foreground transition-colors">
        <Bell size={18} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[9px] font-bold text-primary-foreground flex items-center justify-center">3</span>
      </button>
    </header>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function PageAccueil() {
  const { currentUser, currentRole, effectiveScreens } = useMembership();
  const { brand, isV2 } = useTheme();
  const fonction = currentUser.fonctions[0] || currentRole.label;
  const allocation = ALLOCATION_BASE.map((a, i) => ({ ...a, color: brand.allocation[i] }));
  return (
    <div className="space-y-8">
      {/* Hero strip — couleurs via variables V1/V2 */}
      <div
        className="relative overflow-hidden rounded-xl border border-border p-8"
        style={{
          background: `linear-gradient(105deg, var(--hero-from), var(--hero-via), var(--hero-to))`,
          color: "var(--hero-fg)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 39px,var(--hero-grid) 39px,var(--hero-grid) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,var(--hero-grid) 39px,var(--hero-grid) 40px)`,
          }}
        />
        {isV2 && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--finx-premium)]" />}
        <div className="relative">
          <p className="font-mono text-xs tracking-[0.25em] uppercase mb-2">
            <span className="text-primary">FINX CLUB — GIE</span>
          </p>
          <h2 className="font-display text-4xl font-bold uppercase tracking-wide leading-tight mb-1" style={{ color: "var(--hero-fg)" }}>
            Bienvenue, {currentUser.nom}
          </h2>
          <p className="text-sm" style={{ color: "var(--hero-muted)" }}>
            {fonction} · {STATUS_LABELS[currentUser.statut]}
            {currentUser.niveau ? ` N${currentUser.niveau}` : ""} · {effectiveScreens.length} écrans accessibles
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono border ${
              isV2
                ? "bg-[var(--finx-navy)] text-white border-[var(--finx-navy)]"
                : "bg-primary/20 border border-primary/30 text-primary"
            }`}>
              <Shield size={11} /> {currentRole.label}
            </span>
            {currentUser.badgeInvestisseur && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/25 border border-primary/50 rounded text-[var(--premium-foreground)] text-xs font-mono">
                <Star size={11} className="text-[var(--finx-premium)]" /> Membre Investisseur
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs font-mono">
              <Activity size={11} /> Maquette mémoire
            </span>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_HERO.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{s.label}</p>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-mono ${s.up ? "text-emerald-400" : "text-red-400"}`}>
              {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {s.delta} vs mois dernier
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Valorisation du portefeuille</p>
              <p className="font-display text-xl font-bold text-foreground mt-0.5">4 750 000 000 FCFA</p>
            </div>
            <Badge variant="success">+48.4% YTD</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={PORTFOLIO_DATA}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={brand.chartFill} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={brand.chartFill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={brand.grid} />
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: brand.muted, fontFamily: "Arimo" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 6, fontSize: 11, fontFamily: "Arimo", color: isV2 ? brand.navy : "#F4F7FB" }} />
              <Area type="monotone" dataKey="valeur" stroke={brand.chartStroke} strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Allocation</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={allocation} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                {allocation.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {allocation.map((a) => (
              <div key={a.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                  <span className="text-xs text-muted-foreground">{a.name}</span>
                </div>
                <span className="font-mono text-xs text-foreground">{a.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Dernières souscriptions</p>
          <div className="space-y-3">
            {SUBSCRIPTIONS.slice(0, 4).map((s) => (
              <div key={s.ref} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-xs font-medium text-foreground">{s.membre}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{s.ref} · {s.programme.slice(0, 20)}…</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-primary">{s.montant}</p>
                  <StatutBadge statut={s.statut} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Prochains événements</p>
          <div className="space-y-3">
            {EVENTS.slice(0, 4).map((e) => (
              <div key={e.titre} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="w-8 h-8 bg-primary/20 rounded flex flex-col items-center justify-center shrink-0">
                  <span className="font-mono text-[9px] text-primary font-bold leading-none">{e.date.split(" ")[0]}</span>
                  <span className="font-mono text-[8px] text-primary/70">{e.date.split(" ")[1]?.slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{e.titre}</p>
                  <p className="text-[10px] text-muted-foreground">{e.heure} · {e.lieu}</p>
                </div>
                <StatutBadge statut={e.statut} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PageAccesRefuse({ screen }: { screen: Section }) {
  const { currentUser, currentRole, setCurrentUserId, members } = useMembership();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
        <Lock size={22} className="text-red-400" />
      </div>
      <h2 className="font-display text-2xl font-bold uppercase text-foreground">Accès restreint</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        L'écran <span className="text-primary font-mono">{screen}</span> n'est pas autorisé pour{" "}
        <strong className="text-foreground">{currentUser.nom}</strong> ({currentRole.label}).
      </p>
      <p className="text-xs text-muted-foreground">
        Changez d'identité dans la sidebar, ou connectez-vous en Administrateur pour gérer les droits.
      </p>
      <select
        className="bg-secondary border border-border rounded px-3 py-2 text-xs font-mono text-foreground"
        value={currentUser.id}
        onChange={(e) => setCurrentUserId(e.target.value)}
      >
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.nom}</option>
        ))}
      </select>
    </div>
  );
}

function PageEvenements() {
  return (
    <div className="space-y-6">
      <SectionTitle label="Agenda" title="Événements & Activités" subtitle="Planification et suivi des événements du club." />
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium">
          <Plus size={13} /> Créer un événement
        </button>
        <div className="flex gap-1 border border-border rounded p-0.5">
          {["Liste", "Calendrier"].map(v => (
            <button key={v} className={`px-3 py-1 rounded text-xs ${v === "Liste" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>{v}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {EVENTS.map((e) => (
          <Card key={e.titre} className="p-5 hover:border-primary/30 transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-lg flex flex-col items-center justify-center shrink-0">
                <span className="font-display text-xl font-bold text-primary leading-none">{e.date.split(" ")[0]}</span>
                <span className="font-mono text-[9px] text-primary/70 uppercase">{e.date.split(" ")[1]?.slice(0, 3)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-foreground text-sm mb-1">{e.titre}</h3>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><Clock size={10} /> {e.heure}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} /> {e.lieu}</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {e.inscrits} inscrits</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="neutral">{e.type}</Badge>
                    <StatutBadge statut={e.statut} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PageProgrammes() {
  return (
    <div className="space-y-6">
      <SectionTitle label="Investissement" title="Programmes d'Investissement" subtitle="Instruments disponibles pour les membres et investisseurs du club." />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {PROGRAMS.map((p) => (
          <Card key={p.code} className="p-5 flex flex-col hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-[10px] text-primary tracking-widest">{p.code}</p>
                <h3 className="font-display text-base font-bold text-foreground uppercase mt-0.5">{p.nom}</h3>
              </div>
              <StatutBadge statut={p.statut} />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Catégorie</span>
                <Badge variant="neutral">{p.categorie}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Rendement attendu</span>
                <span className="font-mono text-xs text-emerald-400">{p.rendement}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Durée</span>
                <span className="font-mono text-xs text-foreground">{p.duree}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ticket minimum</span>
                <span className="font-mono text-xs text-foreground">{p.min}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Souscripteurs</span>
                <span className="font-mono text-xs text-foreground">{p.souscripteurs}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex gap-2">
              <button className="flex-1 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors">Souscrire</button>
              <button className="px-3 py-1.5 border border-border rounded text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">Détails</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PagePartenaires() {
  const { brand, isV2 } = useTheme();
  return (
    <div className="space-y-6">
      <SectionTitle label="Réseau" title="Partenariats" subtitle="Partenaires académiques, institutionnels et professionnels du GIE." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PARTNERS.map((p) => (
          <Card key={p.nom} className="p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary border border-border rounded-lg flex items-center justify-center shrink-0">
                {p.type === "Académique" && <BookOpen size={20} className="text-primary" />}
                {p.type === "Institutionnel" && <Shield size={20} className="text-primary" />}
                {p.type === "Professionnel" && <Briefcase size={20} className="text-primary" />}
                {p.type === "Entreprise" && <Building2 size={20} className="text-primary" />}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-foreground text-sm">{p.nom}</h3>
                  <ExternalLink size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <Badge variant="neutral">{p.type}</Badge>
                  <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1"><Globe size={9} /> {p.pays}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">Depuis {p.depuis}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1"><Layers size={9} /> {p.domaine}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Répartition par type</p>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={[
            { type: "Académique", count: 2 },
            { type: "Institutionnel", count: 2 },
            { type: "Professionnel", count: 1 },
            { type: "Entreprise", count: 1 },
          ]} layout="vertical">
            <XAxis type="number" hide />
            <YAxis dataKey="type" type="category" tick={{ fontSize: 10, fill: brand.muted, fontFamily: "Arimo" }} axisLine={false} tickLine={false} width={100} />
            <Bar dataKey="count" fill={brand.chartStroke} radius={[0, 4, 4, 0]} />
            <Tooltip contentStyle={{ background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 6, fontSize: 11, color: isV2 ? brand.navy : "#F4F7FB" }} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function PageSouscription() {
  const [step, setStep] = useState(1);
  return (
    <div className="space-y-6">
      <SectionTitle label="Procédure" title="Souscription" subtitle="Processus de souscription aux programmes d'investissement." />

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {["Sélection", "Informations", "Montant", "Validation", "Confirmation"].map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold ${i + 1 <= step ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                {i + 1 < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] font-mono mt-1 whitespace-nowrap ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
            </div>
            {i < 4 && <div className={`flex-1 h-px mx-2 mt-[-16px] ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h3 className="font-display text-base font-bold text-foreground uppercase mb-4">Étape 1 — Sélection du programme</h3>
            <div className="space-y-3">
              {PROGRAMS.slice(0, 4).map((p) => (
                <label key={p.code} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${p.code === "PGM-002" ? "border-primary/50 bg-primary/10" : "border-border hover:border-primary/20"}`}>
                  <input type="radio" name="program" defaultChecked={p.code === "PGM-002"} className="accent-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{p.nom}</p>
                      <span className="font-mono text-xs text-emerald-400">{p.rendement}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">Min. {p.min} · {p.duree}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-base font-bold text-foreground uppercase mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              {["Prénom", "Nom", "Numéro de membre", "Téléphone"].map(f => (
                <div key={f}>
                  <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">{f}</label>
                  <input className="w-full bg-input-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" placeholder={f === "Numéro de membre" ? "M-0284" : f === "Téléphone" ? "+225 07 00 00 00" : ""} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-base font-bold text-foreground uppercase mb-4">Montant de souscription</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Montant (FCFA)</label>
                <input className="w-full bg-input-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono" placeholder="500 000" defaultValue="750 000" />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Mode de paiement</label>
                <select className="w-full bg-input-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option>Virement bancaire</option>
                  <option>Mobile Money (Orange)</option>
                  <option>Mobile Money (MTN)</option>
                  <option>Chèque</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-primary text-primary-foreground rounded font-display font-bold uppercase tracking-wide text-sm hover:bg-primary/90 transition-colors">
              Valider la souscription
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Récapitulatif</p>
            <div className="space-y-2">
              {[
                ["Programme", "Portefeuille Actions BRVM"],
                ["Montant", "750 000 FCFA"],
                ["Durée", "24 mois"],
                ["Rendement attendu", "10–15% / an"],
                ["Frais de dossier", "15 000 FCFA"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="font-mono text-xs text-foreground text-right">{v}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total dû</span>
                <span className="font-mono text-sm text-primary font-bold">765 000 FCFA</span>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-amber-500/20 bg-amber-500/5">
            <div className="flex gap-2">
              <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80">Votre souscription sera examinée sous 48h ouvrables. Vous recevrez une confirmation par e-mail.</p>
            </div>
          </Card>
          <Card className="p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Documents requis</p>
            <ul className="space-y-1.5">
              {["Pièce d'identité valide", "Justificatif de domicile", "Attestation de membre", "Preuve de virement"].map(d => (
                <li key={d} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Upload size={10} className="text-primary" /> {d}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* History table */}
      <Card>
        <div className="px-5 py-4 border-b border-border">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Historique des souscriptions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Référence", "Membre", "Programme", "Montant", "Date", "Statut"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBSCRIPTIONS.map((s) => (
                <tr key={s.ref} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-primary">{s.ref}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{s.membre}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.programme}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{s.montant}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{s.date}</td>
                  <td className="px-4 py-3"><StatutBadge statut={s.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PageInvestissements() {
  const { brand, isV2 } = useTheme();
  return (
    <div className="space-y-6">
      <SectionTitle label="Suivi" title="Suivi des Investissements" subtitle="Performances et valorisation en temps réel de vos placements." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: "Capital total investi", value: "8 250 000 FCFA", sub: "3 programmes actifs" },
          { label: "Valorisation actuelle", value: "9 236 500 FCFA", sub: "+986 500 FCFA de gain" },
          { label: "Rendement global", value: "+11.96%", sub: "Depuis le début" },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{s.label}</p>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-5">Rendement mensuel (%)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={PORTFOLIO_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={brand.grid} />
            <XAxis dataKey="mois" tick={{ fontSize: 10, fill: brand.muted, fontFamily: "Arimo" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: brand.muted, fontFamily: "Arimo" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 6, fontSize: 11, color: isV2 ? brand.navy : "#F4F7FB" }} />
            <Bar dataKey="rendement" fill={brand.chartFill} radius={[3, 3, 0, 0]}>
              {PORTFOLIO_DATA.map((entry, i) => (
                <Cell key={i} fill={entry.rendement >= 0 ? brand.chartFill : "#C0392B"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-border">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Détail des placements</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Programme", "Capital investi (FCFA)", "Valorisation (FCFA)", "Rendement", "Statut"].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MY_INVESTMENTS.map((inv) => (
                <tr key={inv.programme} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{inv.programme}</td>
                  <td className="px-5 py-4 font-mono text-xs text-foreground">{inv.investi}</td>
                  <td className="px-5 py-4 font-mono text-xs text-foreground">{inv.valeur}</td>
                  <td className="px-5 py-4 font-mono text-xs text-emerald-400">{inv.rendement}</td>
                  <td className="px-5 py-4"><StatutBadge statut={inv.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PageDocuments() {
  return (
    <div className="space-y-6">
      <SectionTitle label="Base documentaire" title="Gestion Documentaire" subtitle="Bibliothèque officielle des documents du GIE FINX CLUB." />
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium">
          <Upload size={13} /> Déposer un document
        </button>
        <div className="flex gap-1 border border-border rounded p-0.5">
          {["Tous", "Juridique", "Rapport", "Programme", "Partenariat"].map(f => (
            <button key={f} className={`px-3 py-1 rounded text-xs ${f === "Tous" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {DOCUMENTS.map((d) => (
          <Card key={d.nom} className="p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded flex items-center justify-center shrink-0">
              <FileText size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{d.nom}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <Badge variant="neutral">{d.type}</Badge>
                <span className="font-mono text-[10px] text-muted-foreground">{d.taille}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{d.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatutBadge statut={d.acces} />
              <button className="text-muted-foreground hover:text-primary transition-colors"><Download size={14} /></button>
              <button className="text-muted-foreground hover:text-foreground transition-colors"><Share2 size={14} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PageMonEspace() {
  const { currentUser, currentRole, effectiveScreens, screenLabel } = useMembership();
  return (
    <div className="space-y-6">
      <SectionTitle
        label="Espace Membre"
        title="Mon Espace Personnel"
        subtitle={`Tableau de bord personnel de ${currentUser.nom} — ${currentUser.id}.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card className="p-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center mb-3">
              <span className="font-display text-2xl font-bold text-primary">{currentUser.avatar}</span>
            </div>
            <h3 className="font-display text-base font-bold text-foreground uppercase">{currentUser.nom}</h3>
            <p className="font-mono text-xs text-primary mt-0.5">{currentUser.id} · {currentRole.label}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              <Badge variant="default">{STATUS_LABELS[currentUser.statut]}</Badge>
              {currentUser.badgeInvestisseur && <Badge variant="premium">Investisseur</Badge>}
              <Badge variant="neutral">{currentUser.cotisation}</Badge>
            </div>
            <div className="w-full border-t border-border mt-4 pt-4 space-y-2">
              {[
                { icon: Mail, text: currentUser.email },
                { icon: Phone, text: "+225 · maquette" },
                { icon: MapPin, text: "Abidjan / Dakar" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon size={11} className="text-primary shrink-0" /> {text}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Informations de compte</p>
            <div className="space-y-2">
              {[
                ["Adhésion", currentUser.adhesion],
                ["Niveau", currentUser.niveau ? `N${currentUser.niveau}` : "—"],
                ["Fonctions", currentUser.fonctions.join(", ") || "—"],
                ["Écrans autorisés", String(effectiveScreens.length)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">{k}</span>
                  <span className="font-mono text-[11px] text-foreground text-right">{v}</span>
                </div>
              ))}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground mt-3 leading-relaxed">
              Accès : {effectiveScreens.map(screenLabel).join(" · ")}
            </p>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Mes investissements</p>
            <div className="space-y-3">
              {MY_INVESTMENTS.map((inv) => (
                <div key={inv.programme} className="p-3 bg-secondary/50 rounded border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{inv.programme}</p>
                    <span className="font-mono text-xs text-emerald-400 font-bold">{inv.rendement}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground">Investi</p>
                      <p className="font-mono text-xs text-foreground">{inv.investi} FCFA</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground">Valorisation</p>
                      <p className="font-mono text-xs text-primary">{inv.valeur} FCFA</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Mes documents</p>
            <div className="space-y-2">
              {DOCUMENTS.filter(d => d.acces !== "Public").slice(0, 4).map((d) => (
                <div key={d.nom} className="flex items-center gap-3 p-2.5 bg-secondary/30 rounded border border-border/40">
                  <FileText size={13} className="text-primary shrink-0" />
                  <span className="text-xs text-foreground flex-1 truncate">{d.nom}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{d.date}</span>
                  <button className="text-muted-foreground hover:text-primary transition-colors"><Download size={12} /></button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Événements à venir</p>
            <div className="space-y-2">
              {EVENTS.slice(0, 3).map((e) => (
                <div key={e.titre} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                  <div className="w-8 h-8 bg-primary/15 rounded flex flex-col items-center justify-center shrink-0">
                    <span className="font-mono text-[9px] text-primary font-bold">{e.date.split(" ")[0]}</span>
                    <span className="font-mono text-[8px] text-primary/70">{e.date.split(" ")[1]?.slice(0, 3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{e.titre}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{e.lieu}</p>
                  </div>
                  <button className="text-xs text-primary border border-primary/30 rounded px-2 py-0.5 hover:bg-primary/10 transition-colors">S'inscrire</button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PageBackoffice() {
  const { members, roles } = useMembership();
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <SectionTitle label="Administration" title="Back-office" subtitle="Console d'administration réservée aux gestionnaires du GIE." />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded">
          <Lock size={11} className="text-red-400" />
          <span className="font-mono text-[10px] text-red-400">ACCÈS RESTREINT</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Membres (mémoire)", value: String(members.length), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Rôles configurés", value: String(roles.length), icon: KeyRound, color: "text-primary", bg: "bg-primary/10" },
          { label: "Alertes cotisations", value: String(members.filter(m => m.cotisation !== "À jour" && m.cotisation !== "—").length), icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Documents à valider", value: "3", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-8 h-8 ${s.bg} rounded mb-3 flex items-center justify-center`}>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Souscriptions en attente de validation</p>
          <div className="space-y-3">
            {SUBSCRIPTIONS.filter(s => s.statut === "En attente").concat(SUBSCRIPTIONS.slice(0, 2)).map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary/40 rounded border border-border/50">
                <div>
                  <p className="text-xs font-medium text-foreground">{s.membre}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{s.ref} · {s.montant}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs hover:bg-emerald-500/30 transition-colors">Valider</button>
                  <button className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-colors">Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Actions rapides</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: UserCheck, label: "Valider un membre", color: "text-blue-400" },
              { icon: CreditCard, label: "Enregistrer paiement", color: "text-emerald-400" },
              { icon: FileText, label: "Générer rapport", color: "text-primary" },
              { icon: Bell, label: "Envoyer notification", color: "text-amber-400" },
              { icon: Calendar, label: "Créer événement", color: "text-purple-400" },
              { icon: TrendingUp, label: "Mettre à jour NAV", color: "text-red-400" },
            ].map(a => (
              <button key={a.label} className="flex items-center gap-2 p-3 bg-secondary/40 border border-border/50 rounded hover:border-primary/30 hover:bg-secondary transition-colors text-left">
                <a.icon size={14} className={a.color} />
                <span className="text-xs text-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Journal d'activité</p>
          <button className="text-xs text-primary font-mono">Voir tout</button>
        </div>
        <div className="divide-y divide-border/40">
          {[
            { action: "Souscription validée", detail: "SOS-2025-0034 — Konan Kouassi É.", by: "Admin", time: "il y a 12 min", type: "success" },
            { action: "Nouveau membre enregistré", detail: "Bah Yannick — M-0285", by: "Admin", time: "il y a 1h", type: "info" },
            { action: "Rapport Q4 2024 publié", detail: "Accessible aux membres", by: "Admin", time: "il y a 3h", type: "neutral" },
            { action: "Alerte cotisation envoyée", detail: "14 membres en retard notifiés", by: "Système", time: "il y a 5h", type: "warning" },
            { action: "Souscription rejetée", detail: "SOS-2025-0030 — Seydou Traoré", by: "Admin", time: "Hier, 16h22", type: "danger" },
          ].map((log, i) => {
            const colorMap: Record<string, string> = { success: "bg-emerald-500", info: "bg-blue-500", warning: "bg-amber-500", danger: "bg-red-500", neutral: "bg-primary" };
            return (
              <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-secondary/20 transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorMap[log.type]}`} />
                <div className="flex-1">
                  <span className="text-xs font-medium text-foreground">{log.action}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {log.detail}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] text-muted-foreground block">{log.by}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/60">{log.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────

const SECTION_TITLES: Record<Section, string> = {
  accueil: "Tableau de bord",
  membres: "Membres",
  roles: "Rôles & accès",
  evenements: "Événements",
  programmes: "Programmes d'investissement",
  partenaires: "Partenariats",
  souscription: "Souscription",
  investissements: "Suivi des investissements",
  documents: "Documents",
  "mon-espace": "Mon Espace",
  backoffice: "Back-office",
};

function AppShell() {
  const [section, setSection] = useState<Section>("accueil");
  const [collapsed, setCollapsed] = useState(false);
  const { canAccess, effectiveScreens } = useMembership();

  // Si le rôle change et que l'écran courant n'est plus autorisé → accueil
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
      case "membres": return <PageMembresRoles key="membres" initialTab="membres" />;
      case "roles": return <PageMembresRoles key="roles" initialTab="roles" />;
      case "evenements": return <PageEvenements />;
      case "programmes": return <PageProgrammes />;
      case "partenaires": return <PagePartenaires />;
      case "souscription": return <PageSouscription />;
      case "investissements": return <PageInvestissements />;
      case "documents": return <PageDocuments />;
      case "mon-espace": return <PageMonEspace />;
      case "backoffice": return <PageBackoffice />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans" style={{ fontFamily: "'Arimo', system-ui, sans-serif" }}>
      <style>{`
        .font-display { font-family: 'Barlow', 'Arimo', sans-serif; }
        .font-mono { font-family: 'Arimo', ui-monospace, monospace; letter-spacing: 0.02em; }
        .scrollbar-hide { scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <Sidebar active={section} onChange={go} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <Topbar title={SECTION_TITLES[section]} collapsed={collapsed} />

      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ paddingLeft: collapsed ? "4rem" : "15rem" }}
      >
        <div className="p-6 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
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
