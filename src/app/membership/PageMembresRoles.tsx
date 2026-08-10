import { useMemo, useState } from "react";
import {
  Search, Plus, Eye, Edit, Trash2, X, Shield, Lock, Check, Users, KeyRound,
} from "lucide-react";
import { useMembership, computeEffectiveScreens } from "./MembershipContext";
import {
  ALL_SCREENS,
  STATUS_LABELS,
  type Member,
  type MemberStatus,
  type ScreenKey,
} from "./types";

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" | "premium";
}) {
  const styles: Record<string, string> = {
    default: "bg-primary/20 text-primary border border-primary/30",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    info: "bg-primary/15 text-primary border border-primary/25",
    neutral: "bg-white/10 text-foreground/60 border border-white/10",
    premium: "badge-premium bg-[#F5D251]/25 text-[#0B1B59] border border-[#0B1B59]/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-card border border-border rounded-lg ${className}`}>{children}</div>;
}

function SectionTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-primary tracking-[0.2em] uppercase mb-2">{label}</p>
      <h2 className="font-display text-3xl font-bold text-foreground uppercase tracking-wide">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
    </div>
  );
}

function roleTone(tone: string) {
  const map: Record<string, string> = {
    cyan: "bg-primary/20 text-primary border-primary/30",
    navy: "bg-[#0B1B59]/60 text-sky-200 border-sky-400/30",
    premium: "role-tone-premium bg-[#F5D251]/25 text-[#0B1B59] border-[#0B1B59]/20",
    muted: "bg-white/10 text-muted-foreground border-white/10",
    danger: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return map[tone] ?? map.muted;
}

function statusVariant(statut: MemberStatus): "success" | "warning" | "danger" | "neutral" | "info" {
  if (statut === "confirme" || statut === "actif") return "success";
  if (statut === "simple") return "info";
  if (statut === "suspendu") return "danger";
  return "neutral";
}

type Tab = "membres" | "roles";
type ModalMode = "create" | "edit" | "view" | "access" | null;

const emptyForm = (): Omit<Member, "id" | "avatar"> => ({
  nom: "",
  email: "",
  statut: "simple",
  niveau: 0,
  badgeInvestisseur: false,
  roleId: "membre",
  fonctions: [],
  cotisation: "À jour",
  capital: "—",
  adhesion: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
  grantScreens: [],
  denyScreens: [],
});

export function PageMembresRoles({ initialTab = "membres" }: { initialTab?: Tab }) {
  const {
    members, roles, addMember, updateMember, removeMember,
    updateRoleScreens, addRole, screenLabel, currentUser,
  } = useMembership();

  const [tab, setTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id ?? "admin");
  const [newRoleLabel, setNewRoleLabel] = useState("");

  const selected = members.find((m) => m.id === selectedId) ?? null;
  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0];

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          m.nom.toLowerCase().includes(search.toLowerCase()) ||
          m.id.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [members, search],
  );

  const openCreate = () => {
    setForm(emptyForm());
    setSelectedId(null);
    setModal("create");
  };

  const openEdit = (m: Member) => {
    setSelectedId(m.id);
    setForm({
      nom: m.nom,
      email: m.email,
      statut: m.statut,
      niveau: m.niveau,
      badgeInvestisseur: m.badgeInvestisseur,
      roleId: m.roleId,
      fonctions: [...m.fonctions],
      cotisation: m.cotisation,
      capital: m.capital,
      adhesion: m.adhesion,
      grantScreens: [...m.grantScreens],
      denyScreens: [...m.denyScreens],
    });
    setModal("edit");
  };

  const openView = (m: Member) => {
    setSelectedId(m.id);
    setModal("view");
  };

  const openAccess = (m: Member) => {
    setSelectedId(m.id);
    setForm({
      nom: m.nom,
      email: m.email,
      statut: m.statut,
      niveau: m.niveau,
      badgeInvestisseur: m.badgeInvestisseur,
      roleId: m.roleId,
      fonctions: [...m.fonctions],
      cotisation: m.cotisation,
      capital: m.capital,
      adhesion: m.adhesion,
      grantScreens: [...m.grantScreens],
      denyScreens: [...m.denyScreens],
    });
    setModal("access");
  };

  const saveMember = () => {
    if (!form.nom.trim()) return;
    if (modal === "create") {
      addMember({ ...form, fonctions: form.fonctions.filter(Boolean) });
    } else if (modal === "edit" && selectedId) {
      updateMember(selectedId, { ...form, fonctions: form.fonctions.filter(Boolean) });
    }
    setModal(null);
  };

  const saveAccess = () => {
    if (!selectedId) return;
    updateMember(selectedId, {
      roleId: form.roleId,
      grantScreens: form.grantScreens,
      denyScreens: form.denyScreens,
    });
    setModal(null);
  };

  const toggleScreenInList = (list: "grantScreens" | "denyScreens", key: ScreenKey) => {
    setForm((f) => {
      const has = f[list].includes(key);
      const next = has ? f[list].filter((s) => s !== key) : [...f[list], key];
      const other = list === "grantScreens" ? "denyScreens" : "grantScreens";
      return {
        ...f,
        [list]: next,
        [other]: f[other].filter((s) => s !== key),
      };
    });
  };

  const toggleRoleScreen = (key: ScreenKey) => {
    if (!selectedRole) return;
    const has = selectedRole.screens.includes(key);
    const next = has
      ? selectedRole.screens.filter((s) => s !== key)
      : [...selectedRole.screens, key];
    updateRoleScreens(selectedRole.id, next);
  };

  const createCustomRole = () => {
    if (!newRoleLabel.trim()) return;
    const id = `custom-${Date.now()}`;
    addRole({
      id,
      label: newRoleLabel.trim(),
      description: "Rôle personnalisé (maquette mémoire).",
      tone: "cyan",
      screens: ["accueil", "mon-espace", "evenements", "programmes"],
    });
    setSelectedRoleId(id);
    setNewRoleLabel("");
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Gestion"
        title="Membres & Rôles"
        subtitle="Maquette mémoire : statuts, rôles d'accès et restriction d'écrans par membre — sans backend."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 border border-border rounded p-0.5">
          {(
            [
              { id: "membres" as const, label: "Membres", icon: Users },
              { id: "roles" as const, label: "Rôles & accès", icon: KeyRound },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                tab === t.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded">
          <Lock size={11} className="text-primary" />
          <span className="font-mono text-[10px] text-primary">MOCK · EN MÉMOIRE</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono ml-auto">
          Connecté : {currentUser.nom}
        </p>
      </div>

      {tab === "membres" && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-secondary border border-border rounded px-3 py-2 flex-1 max-w-xs">
              <Search size={13} className="text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un membre…"
                className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-mono w-full"
              />
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={13} /> Nouveau membre
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total", value: members.length },
              { label: "Actifs / Confirmés", value: members.filter((m) => m.statut === "actif" || m.statut === "confirme").length },
              { label: "Investisseurs", value: members.filter((m) => m.badgeInvestisseur).length },
              { label: "Restrictions individuelles", value: members.filter((m) => m.grantScreens.length + m.denyScreens.length > 0).length },
            ].map((s) => (
              <Card key={s.label} className="p-3">
                <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
              </Card>
            ))}
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["ID", "Membre", "Statut", "Rôle d'accès", "Niveau", "Cotisation", "Restrictions", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const role = roles.find((r) => r.id === m.roleId);
                    const eff = computeEffectiveScreens(m, roles);
                    const restricted = m.grantScreens.length + m.denyScreens.length > 0;
                    return (
                      <tr key={m.id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-primary">{m.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-mono text-[10px] shrink-0">
                              {m.avatar}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground whitespace-nowrap">{m.nom}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <Badge variant={statusVariant(m.statut)}>{STATUS_LABELS[m.statut]}</Badge>
                            {m.badgeInvestisseur && <Badge variant="premium">Investisseur</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {role && (
                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-mono border ${roleTone(role.tone)}`}>
                              {role.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {m.statut === "actif" || m.statut === "confirme" ? `N${m.niveau || 1}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              m.cotisation === "À jour" ? "success" : m.cotisation === "En retard" ? "warning" : m.cotisation === "Impayée" ? "danger" : "neutral"
                            }
                          >
                            {m.cotisation}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openAccess(m)}
                            className={`text-[11px] font-mono underline-offset-2 hover:underline ${
                              restricted ? "text-primary font-medium" : "text-muted-foreground"
                            }`}
                          >
                            {eff.length} écrans{restricted ? " · custom" : ""}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openView(m)} className="text-muted-foreground hover:text-primary transition-colors" title="Voir">
                              <Eye size={13} />
                            </button>
                            <button onClick={() => openEdit(m)} className="text-muted-foreground hover:text-foreground transition-colors" title="Modifier">
                              <Edit size={13} />
                            </button>
                            <button onClick={() => openAccess(m)} className="text-muted-foreground hover:text-primary transition-colors" title="Restreindre écrans">
                              <Shield size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (m.id === "M-0001") return;
                                if (confirm(`Supprimer ${m.nom} ? (maquette mémoire)`)) removeMember(m.id);
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                              disabled={m.id === "M-0001"}
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-border">
              <p className="font-mono text-[10px] text-muted-foreground">
                {filtered.length} membre{filtered.length > 1 ? "s" : ""} · données volatiles (rafraîchir = reset)
              </p>
            </div>
          </Card>
        </>
      )}

      {tab === "roles" && (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          <Card className="p-3 space-y-1">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-2">Rôles</p>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                  selectedRoleId === r.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span className="font-medium block">{r.label}</span>
                <span className="font-mono text-[10px] opacity-70">{r.screens.length} écrans</span>
              </button>
            ))}
            <div className="pt-3 border-t border-border mt-2 space-y-2">
              <input
                value={newRoleLabel}
                onChange={(e) => setNewRoleLabel(e.target.value)}
                placeholder="Nouveau rôle…"
                className="w-full bg-input-background border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={createCustomRole}
                className="w-full flex items-center justify-center gap-1 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium"
              >
                <Plus size={12} /> Ajouter
              </button>
            </div>
          </Card>

          {selectedRole && (
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground uppercase">{selectedRole.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRole.description}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-mono border ${roleTone(selectedRole.tone)}`}>
                  {selectedRole.locked ? "Système" : "Personnalisé"}
                </span>
              </div>

              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                Matrice d'accès aux écrans
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {ALL_SCREENS.map((s) => {
                  const on = selectedRole.screens.includes(s.key);
                  return (
                    <button
                      key={s.key}
                      onClick={() => toggleRoleScreen(s.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded border text-left text-xs transition-colors ${
                        on
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-border bg-secondary/30 text-muted-foreground"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                        {on && <Check size={10} />}
                      </span>
                      <span>
                        <span className="font-medium block">{s.label}</span>
                        <span className="font-mono text-[10px] opacity-60">{s.group}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-4">
                Les membres avec ce rôle héritent de ces écrans. Des exceptions individuelles se gèrent via l'icône bouclier sur chaque membre.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-display text-lg font-bold uppercase text-foreground">
                {modal === "create" && "Nouveau membre"}
                {modal === "edit" && "Modifier le membre"}
                {modal === "view" && "Fiche membre"}
                {modal === "access" && "Restriction d'écrans"}
              </h3>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {(modal === "create" || modal === "edit") && (
                <>
                  <Field label="Nom complet">
                    <input className="field" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                  </Field>
                  <Field label="Email">
                    <input className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Statut club">
                      <select
                        className="field"
                        value={form.statut}
                        onChange={(e) => setForm({ ...form, statut: e.target.value as MemberStatus })}
                      >
                        {(Object.keys(STATUS_LABELS) as MemberStatus[]).map((k) => (
                          <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Niveau (Actif)">
                      <select
                        className="field"
                        value={form.niveau}
                        onChange={(e) => setForm({ ...form, niveau: Number(e.target.value) })}
                      >
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{n === 0 ? "—" : `N${n}`}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Rôle d'accès">
                    <select className="field" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Cotisation">
                      <select
                        className="field"
                        value={form.cotisation}
                        onChange={(e) => setForm({ ...form, cotisation: e.target.value as Member["cotisation"] })}
                      >
                        {["À jour", "En retard", "Impayée", "—"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Capital">
                      <input className="field" value={form.capital} onChange={(e) => setForm({ ...form, capital: e.target.value })} />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.badgeInvestisseur}
                      onChange={(e) => setForm({ ...form, badgeInvestisseur: e.target.checked })}
                      className="accent-[#01AAE4]"
                    />
                    Badge Membre Investisseur (≥ 500 000 FCFA)
                  </label>
                  <Field label="Fonctions (séparées par virgule)">
                    <input
                      className="field"
                      value={form.fonctions.join(", ")}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          fonctions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="Secrétaire, Président de Groupe…"
                    />
                  </Field>
                </>
              )}

              {modal === "view" && selected && (
                <div className="space-y-3 text-sm">
                  {[
                    ["ID", selected.id],
                    ["Email", selected.email],
                    ["Statut", STATUS_LABELS[selected.statut]],
                    ["Niveau", selected.niveau ? `N${selected.niveau}` : "—"],
                    ["Rôle", roles.find((r) => r.id === selected.roleId)?.label ?? "—"],
                    ["Investisseur", selected.badgeInvestisseur ? "Oui" : "Non"],
                    ["Fonctions", selected.fonctions.join(", ") || "—"],
                    ["Cotisation", selected.cotisation],
                    ["Capital", selected.capital],
                    ["Adhésion", selected.adhesion],
                    [
                      "Écrans effectifs",
                      computeEffectiveScreens(selected, roles).map(screenLabel).join(", "),
                    ],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex gap-3 border-b border-border/40 pb-2">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase w-28 shrink-0 pt-0.5">{k}</span>
                      <span className="text-foreground text-xs">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {modal === "access" && selected && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Exceptions pour <strong className="text-foreground">{selected.nom}</strong> — au-delà du rôle{" "}
                    <strong className="text-primary">{roles.find((r) => r.id === form.roleId)?.label}</strong>.
                  </p>
                  <Field label="Rôle de base">
                    <select className="field" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </Field>
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Accorder en plus</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_SCREENS.map((s) => (
                        <Chip
                          key={s.key}
                          active={form.grantScreens.includes(s.key)}
                          onClick={() => toggleScreenInList("grantScreens", s.key)}
                          tone="grant"
                        >
                          {s.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Retirer (restreindre)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_SCREENS.map((s) => (
                        <Chip
                          key={s.key}
                          active={form.denyScreens.includes(s.key)}
                          onClick={() => toggleScreenInList("denyScreens", s.key)}
                          tone="deny"
                        >
                          {s.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <Card className="p-3 bg-secondary/40">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Aperçu accès effectif</p>
                    <p className="text-xs text-foreground">
                      {computeEffectiveScreens(
                        { ...selected, roleId: form.roleId, grantScreens: form.grantScreens, denyScreens: form.denyScreens },
                        roles,
                      )
                        .map(screenLabel)
                        .join(" · ") || "Aucun"}
                    </p>
                  </Card>
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-border flex gap-2 justify-end sticky bottom-0 bg-card">
              <button onClick={() => setModal(null)} className="px-3 py-2 text-xs border border-border rounded text-muted-foreground hover:text-foreground">
                Fermer
              </button>
              {(modal === "create" || modal === "edit") && (
                <button onClick={saveMember} className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded font-medium">
                  Enregistrer
                </button>
              )}
              {modal === "access" && (
                <button onClick={saveAccess} className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded font-medium">
                  Appliquer les restrictions
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .field {
          width: 100%;
          background: var(--input-background);
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          color: var(--foreground);
          outline: none;
        }
        .field:focus { border-color: rgba(1, 170, 228, 0.5); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
      {children}
    </label>
  );
}

function Chip({
  children,
  active,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tone: "grant" | "deny";
}) {
  const activeCls =
    tone === "grant"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
      : "bg-red-500/20 text-red-400 border-red-500/40";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
        active ? activeCls : "border-border text-muted-foreground hover:border-primary/30"
      }`}
    >
      {children}
    </button>
  );
}
