import { useMemo, useState } from "react";
import {
  Plus, Search, Shield, Lock, Check, Users, KeyRound, Award, Activity,
  Calendar, Settings, TrendingUp, UserCheck, X, Eye, Edit, Trash2,
} from "lucide-react";
import { computeEffectiveScreens, useMembership } from "./MembershipContext";
import {
  ALL_SCREENS,
  CHANGE_LABELS,
  FONCTION_LABELS,
  PARTICIPATION_LABELS,
  STATUS_LABELS,
  type FonctionType,
  type Member,
  type MemberStatus,
  type ParticipationType,
  type ScreenKey,
} from "./types";
import {
  Badge, Card, Field, SectionTitle, StatusBadge, fieldClass, roleTone,
} from "./ui";

export function PageAccueil() {
  const { members, currentUser, currentRole, params, history, progressionVersSuivant, sessions } = useMembership();
  const prog = progressionVersSuivant(currentUser);
  const stats = [
    { label: "Membres", value: members.length },
    { label: "Actifs / Confirmés", value: members.filter((m) => m.statut === "actif" || m.statut === "confirme").length },
    { label: "Investisseurs", value: members.filter((m) => m.badgeInvestisseur).length },
    { label: "Fonctions actives", value: members.reduce((n, m) => n + m.fonctions.filter((f) => f.active).length, 0) },
  ];

  return (
    <div className="space-y-8">
      <div
        className="relative overflow-hidden rounded-xl border border-border p-8"
        style={{ background: "linear-gradient(105deg, var(--hero-from), var(--hero-via), var(--hero-to))" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--finx-premium)]" />
        <p className="font-mono text-xs text-primary tracking-[0.25em] uppercase mb-2">FINX CLUB — Membres & statuts</p>
        <h2 className="font-display text-4xl font-bold text-foreground uppercase tracking-wide mb-1">
          Bienvenue, {currentUser.nom}
        </h2>
        <p className="text-sm text-muted-foreground">
          {currentRole.label} · {STATUS_LABELS[currentUser.statut]}
          {currentUser.niveau ? ` N${currentUser.niveau}` : ""}
          {currentUser.badgeInvestisseur ? " · Investisseur" : ""}
        </p>
        <div className="mt-5 max-w-md">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
            <span>{prog.label}</span>
            <span>{prog.current}/{prog.target}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${prog.pct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{s.label}</p>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Règles actives (paramétrables)</p>
          <ul className="space-y-2 text-xs text-foreground">
            <li>N1 = {params.participationsParNiveau[1]} participations · N5 = {params.participationsParNiveau[5]}</li>
            <li>Confirmé dès {params.participationsPourConfirme} participations (permanent)</li>
            <li>{params.absencesAvantRetrogradation} absences → rétrogradation Simple</li>
            <li>{params.presencesPourRecuperation} présences consécutives → récupération Actif</li>
            <li>Investisseur ≥ {params.seuilInvestisseurFcfa.toLocaleString("fr-FR")} FCFA</li>
            <li>Gouvernance dès N{params.niveauMinGouvernance}</li>
          </ul>
        </Card>
        <Card className="p-5">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Derniers changements de statut</p>
          <div className="space-y-3">
            {history.slice(0, 5).map((h) => {
              const m = members.find((x) => x.id === h.memberId);
              return (
                <div key={h.id} className="border-b border-border/50 pb-2">
                  <p className="text-xs font-medium text-foreground">{m?.nom ?? h.memberId}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {CHANGE_LABELS[h.type]} · {h.motif}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-3">
            {sessions.length} session(s) réservée(s) investisseurs
          </p>
        </Card>
      </div>
    </div>
  );
}

export function PageMembres() {
  const { members, roles, addMember, updateMember, removeMember, screenLabel } = useMembership();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | "view" | "access" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nom: "", email: "", statut: "simple" as MemberStatus, niveau: 0,
    roleId: "membre", cotisation: "À jour" as Member["cotisation"],
    capitalInvesti: 0, adhesion: "18 Août 2026",
    grantScreens: [] as ScreenKey[], denyScreens: [] as ScreenKey[],
  });

  const selected = members.find((m) => m.id === selectedId);
  const filtered = useMemo(
    () => members.filter((m) => m.nom.toLowerCase().includes(search.toLowerCase()) || m.id.includes(search)),
    [members, search],
  );

  const openCreate = () => {
    setForm({
      nom: "", email: "", statut: "simple", niveau: 0, roleId: "membre",
      cotisation: "À jour", capitalInvesti: 0, adhesion: "18 Août 2026",
      grantScreens: [], denyScreens: [],
    });
    setModal("create");
  };

  const openEdit = (m: Member) => {
    setSelectedId(m.id);
    setForm({
      nom: m.nom, email: m.email, statut: m.statut, niveau: m.niveau, roleId: m.roleId,
      cotisation: m.cotisation, capitalInvesti: m.capitalInvesti, adhesion: m.adhesion,
      grantScreens: [...m.grantScreens], denyScreens: [...m.denyScreens],
    });
    setModal("edit");
  };

  const save = () => {
    if (!form.nom.trim()) return;
    if (modal === "create") {
      addMember({ ...form, badgeInvestisseur: form.capitalInvesti >= 500_000, grantScreens: form.grantScreens, denyScreens: form.denyScreens });
    } else if (modal === "edit" && selectedId) {
      updateMember(selectedId, form);
    } else if (modal === "access" && selectedId) {
      updateMember(selectedId, { roleId: form.roleId, grantScreens: form.grantScreens, denyScreens: form.denyScreens });
    }
    setModal(null);
  };

  const toggle = (list: "grantScreens" | "denyScreens", key: ScreenKey) => {
    setForm((f) => {
      const has = f[list].includes(key);
      const next = has ? f[list].filter((s) => s !== key) : [...f[list], key];
      const other = list === "grantScreens" ? "denyScreens" : "grantScreens";
      return { ...f, [list]: next, [other]: f[other].filter((s) => s !== key) };
    });
  };

  return (
    <div className="space-y-6">
      <SectionTitle label="Gestion" title="Membres du Club" subtitle="Statuts, niveaux N1–N5, badge Investisseur et restrictions d'écrans — données en mémoire." />
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-secondary border border-border rounded px-3 py-2 flex-1 max-w-xs">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="bg-transparent text-xs w-full focus:outline-none" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium">
          <Plus size={13} /> Nouveau membre
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded">
          <Lock size={11} className="text-primary" />
          <span className="font-mono text-[10px] text-primary">MOCK · MÉMOIRE</span>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Membre", "Statut", "Niveau", "Rôle", "Capital", "Présences", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const role = roles.find((r) => r.id === m.roleId);
                return (
                  <tr key={m.id} className="border-b border-border/40 hover:bg-secondary/40">
                    <td className="px-4 py-3 font-mono text-[11px] text-primary">{m.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center justify-center">{m.avatar}</div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{m.nom}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge statut={m.statut} />
                        {m.badgeInvestisseur && <Badge variant="premium">Investisseur</Badge>}
                        {m.enRecuperation && <Badge variant="warning">Récupération</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{m.niveau ? `N${m.niveau}` : "—"}</td>
                    <td className="px-4 py-3">
                      {role && <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-mono border ${roleTone(role.tone)}`}>{role.label}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{m.capitalInvesti.toLocaleString("fr-FR")} F</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.nbPresences}P / {m.nbAbsences}A</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedId(m.id); setModal("view"); }} className="text-muted-foreground hover:text-primary"><Eye size={13} /></button>
                        <button onClick={() => openEdit(m)} className="text-muted-foreground hover:text-foreground"><Edit size={13} /></button>
                        <button onClick={() => { setSelectedId(m.id); setForm({ ...form, roleId: m.roleId, grantScreens: [...m.grantScreens], denyScreens: [...m.denyScreens], nom: m.nom, email: m.email, statut: m.statut, niveau: m.niveau, cotisation: m.cotisation, capitalInvesti: m.capitalInvesti, adhesion: m.adhesion }); setModal("access"); }} className="text-muted-foreground hover:text-primary"><Shield size={13} /></button>
                        <button disabled={m.id === "M-0001"} onClick={() => removeMember(m.id)} className="text-muted-foreground hover:text-destructive disabled:opacity-30"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <h3 className="font-display text-lg font-bold uppercase text-foreground">
                {modal === "create" && "Nouveau membre"}
                {modal === "edit" && "Modifier"}
                {modal === "view" && "Fiche membre"}
                {modal === "access" && "Restrictions d'écrans"}
              </h3>
              <button onClick={() => setModal(null)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-3">
              {(modal === "create" || modal === "edit") && (
                <>
                  <Field label="Nom"><input className={fieldClass} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></Field>
                  <Field label="Email"><input className={fieldClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Statut">
                      <select className={fieldClass} value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as MemberStatus })}>
                        {(Object.keys(STATUS_LABELS) as MemberStatus[]).map((k) => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
                      </select>
                    </Field>
                    <Field label="Niveau">
                      <select className={fieldClass} value={form.niveau} onChange={(e) => setForm({ ...form, niveau: Number(e.target.value) })}>
                        {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 0 ? "—" : `N${n}`}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Rôle">
                    <select className={fieldClass} value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Capital investi (FCFA)">
                    <input type="number" className={fieldClass} value={form.capitalInvesti} onChange={(e) => setForm({ ...form, capitalInvesti: Number(e.target.value) })} />
                  </Field>
                </>
              )}
              {modal === "view" && selected && (
                <div className="space-y-2 text-xs">
                  {[
                    ["Statut", STATUS_LABELS[selected.statut]],
                    ["Niveau", selected.niveau ? `N${selected.niveau}` : "—"],
                    ["Présences / Absences", `${selected.nbPresences} / ${selected.nbAbsences}`],
                    ["Consecutives", String(selected.consecutives)],
                    ["Capital", `${selected.capitalInvesti.toLocaleString("fr-FR")} FCFA`],
                    ["Groupes", selected.groupes.join(", ") || "—"],
                    ["Fonctions", selected.fonctions.filter((f) => f.active).map((f) => FONCTION_LABELS[f.type]).join(", ") || "—"],
                    ["Écrans", computeEffectiveScreens(selected, roles).map(screenLabel).join(" · ")],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3 border-b border-border/40 pb-2">
                      <span className="font-mono text-[10px] text-muted-foreground w-28">{k}</span>
                      <span className="text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {modal === "access" && (
                <>
                  <Field label="Rôle de base">
                    <select className={fieldClass} value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  </Field>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Accorder</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_SCREENS.map((s) => (
                      <button key={s.key} type="button" onClick={() => toggle("grantScreens", s.key)}
                        className={`px-2 py-1 rounded text-[10px] font-mono border ${form.grantScreens.includes(s.key) ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/40" : "border-border text-muted-foreground"}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mt-2">Restreindre</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_SCREENS.map((s) => (
                      <button key={s.key} type="button" onClick={() => toggle("denyScreens", s.key)}
                        className={`px-2 py-1 rounded text-[10px] font-mono border ${form.denyScreens.includes(s.key) ? "bg-red-500/15 text-red-600 border-red-500/40" : "border-border text-muted-foreground"}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-3 py-2 text-xs border border-border rounded text-muted-foreground">Fermer</button>
              {modal !== "view" && <button onClick={save} className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded font-medium">Enregistrer</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PageRoles() {
  const { roles, updateRoleScreens, addRole } = useMembership();
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id ?? "admin");
  const [newLabel, setNewLabel] = useState("");
  const selected = roles.find((r) => r.id === selectedRoleId) ?? roles[0];

  return (
    <div className="space-y-6">
      <SectionTitle label="Gestion" title="Rôles & privilèges" subtitle="Matrice d'accès aux écrans de cette fonctionnalité." />
      <div className="grid lg:grid-cols-[240px_1fr] gap-4">
        <Card className="p-3 space-y-1">
          {roles.map((r) => (
            <button key={r.id} onClick={() => setSelectedRoleId(r.id)}
              className={`w-full text-left px-3 py-2 rounded text-xs ${selectedRoleId === r.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
              <span className="font-medium block">{r.label}</span>
              <span className="font-mono text-[10px] opacity-70">{r.screens.length} écrans</span>
            </button>
          ))}
          <div className="pt-3 border-t border-border space-y-2">
            <input className={fieldClass} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Nouveau rôle…" />
            <button
              onClick={() => { if (!newLabel.trim()) return; addRole({ label: newLabel.trim(), description: "Rôle custom", tone: "cyan", screens: ["accueil", "mon-espace"] }); setNewLabel(""); }}
              className="w-full py-1.5 bg-primary text-primary-foreground rounded text-xs"
            >
              <Plus size={12} className="inline mr-1" /> Ajouter
            </button>
          </div>
        </Card>
        {selected && (
          <Card className="p-5">
            <h3 className="font-display text-xl font-bold uppercase text-foreground mb-1">{selected.label}</h3>
            <p className="text-sm text-muted-foreground mb-4">{selected.description}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {ALL_SCREENS.map((s) => {
                const on = selected.screens.includes(s.key);
                return (
                  <button key={s.key} onClick={() => {
                    const next = on ? selected.screens.filter((x) => x !== s.key) : [...selected.screens, s.key];
                    updateRoleScreens(selected.id, next);
                  }}
                    className={`flex items-center gap-2 px-3 py-2 rounded border text-left text-xs ${on ? "border-primary/40 bg-primary/10" : "border-border bg-secondary/40 text-muted-foreground"}`}>
                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${on ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                      {on && <Check size={10} />}
                    </span>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export function PageGouvernance() {
  const { members, params, nominateFonction, endFonction } = useMembership();
  const [memberId, setMemberId] = useState("M-0284");
  const [type, setType] = useState<FonctionType>("secretaire");
  const [groupe, setGroupe] = useState("Groupe Étudiants");
  const [msg, setMsg] = useState<string | null>(null);

  const actives = members.flatMap((m) =>
    m.fonctions.filter((f) => f.active).map((f) => ({ member: m, fonction: f })),
  );

  const nominate = () => {
    const err = nominateFonction(memberId, {
      type,
      groupeOuPole: groupe,
      dateNomination: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
      dureeMandat: "2 ans",
      responsabilites: `Mandat ${FONCTION_LABELS[type]} — maquette`,
    });
    setMsg(err ?? "Nomination enregistrée (mémoire)");
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Gestion"
        title="Fonctions de gouvernance"
        subtitle={`Président de Groupe / Pôle / Secrétaire — minimum N${params.niveauMinGouvernance} (paramétrable).`}
      />
      <Card className="p-5 space-y-3 max-w-xl">
        <Field label="Membre">
          <select className={fieldClass} value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.nom} · {STATUS_LABELS[m.statut]}{m.niveau ? ` N${m.niveau}` : ""}</option>
            ))}
          </select>
        </Field>
        <Field label="Fonction">
          <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value as FonctionType)}>
            {(Object.keys(FONCTION_LABELS) as FonctionType[]).map((k) => <option key={k} value={k}>{FONCTION_LABELS[k]}</option>)}
          </select>
        </Field>
        <Field label="Groupe / Pôle">
          <input className={fieldClass} value={groupe} onChange={(e) => setGroupe(e.target.value)} />
        </Field>
        <button onClick={nominate} className="px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium">Nommer</button>
        {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      </Card>

      <div className="grid gap-3">
        {actives.map(({ member, fonction }) => (
          <Card key={fonction.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award size={18} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{FONCTION_LABELS[fonction.type]}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {member.nom} · {fonction.groupeOuPole} · depuis {fonction.dateNomination} · mandat {fonction.dureeMandat}
                </p>
              </div>
            </div>
            <button onClick={() => endFonction(member.id, fonction.id)} className="text-xs text-red-600 border border-red-500/30 rounded px-2 py-1">Clôturer</button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PageParticipations() {
  const { members, participations, recordParticipation, history } = useMembership();
  const [memberId, setMemberId] = useState("M-0280");
  const [type, setType] = useState<ParticipationType>("reunion");
  const [titre, setTitre] = useState("Réunion mensuelle");
  const [present, setPresent] = useState(true);

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Suivi"
        title="Participations"
        subtitle="Enregistrer présence / absence — déclenche niveaux, rétrogradations et récupérations (mock)."
      />
      <Card className="p-5 grid sm:grid-cols-2 gap-3 max-w-3xl">
        <Field label="Membre">
          <select className={fieldClass} value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            {members.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </Field>
        <Field label="Type">
          <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value as ParticipationType)}>
            {(Object.keys(PARTICIPATION_LABELS) as ParticipationType[]).map((k) => <option key={k} value={k}>{PARTICIPATION_LABELS[k]}</option>)}
          </select>
        </Field>
        <Field label="Titre activité">
          <input className={fieldClass} value={titre} onChange={(e) => setTitre(e.target.value)} />
        </Field>
        <Field label="Résultat">
          <select className={fieldClass} value={present ? "1" : "0"} onChange={(e) => setPresent(e.target.value === "1")}>
            <option value="1">Présent</option>
            <option value="0">Absent</option>
          </select>
        </Field>
        <button
          onClick={() => recordParticipation({ memberId, type, titre, present })}
          className="sm:col-span-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium"
        >
          Enregistrer la participation
        </button>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-4 py-3 border-b border-border font-mono text-[10px] text-muted-foreground uppercase">Historique participations</div>
          <div className="divide-y divide-border/40 max-h-80 overflow-y-auto">
            {participations.slice(0, 20).map((p) => {
              const m = members.find((x) => x.id === p.memberId);
              return (
                <div key={p.id} className="px-4 py-2.5 flex justify-between gap-2 text-xs">
                  <div>
                    <p className="font-medium text-foreground">{p.titre}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{m?.nom} · {PARTICIPATION_LABELS[p.type]} · {p.date}</p>
                  </div>
                  <Badge variant={p.present ? "success" : "danger"}>{p.present ? "Présent" : "Absent"}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <div className="px-4 py-3 border-b border-border font-mono text-[10px] text-muted-foreground uppercase">Changements de statut</div>
          <div className="divide-y divide-border/40 max-h-80 overflow-y-auto">
            {history.slice(0, 20).map((h) => {
              const m = members.find((x) => x.id === h.memberId);
              return (
                <div key={h.id} className="px-4 py-2.5 text-xs">
                  <p className="font-medium text-foreground">{CHANGE_LABELS[h.type]} — {m?.nom}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{h.date} · {h.motif}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PageSessions() {
  const { sessions, members, currentUser, toggleSessionInscription } = useMembership();
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Suivi"
        title="Sessions réservées"
        subtitle="Sessions d'information trimestrielles — accès Membres Investisseurs uniquement."
      />
      {!currentUser.badgeInvestisseur && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/10 text-xs text-amber-800">
          Vous n'avez pas le badge Investisseur (capital &lt; seuil). L'inscription sera refusée — testez avec un autre profil.
        </Card>
      )}
      <div className="grid gap-4">
        {sessions.map((s) => {
          const inscrit = s.inscrits.includes(currentUser.id);
          return (
            <Card key={s.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold uppercase text-foreground">{s.titre}</h3>
                  <p className="font-mono text-[11px] text-muted-foreground mt-1">
                    {s.date} · {s.heure} · {s.lieu}
                  </p>
                  <p className="text-xs text-primary mt-1">{s.lienVisio}</p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-2">
                    {s.inscrits.length}/{s.places} inscrits · docs : {s.documents.join(", ") || "—"}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.inscrits.map((id) => {
                      const m = members.find((x) => x.id === id);
                      return <Badge key={id} variant="premium">{m?.avatar ?? id}</Badge>;
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setFeedback(toggleSessionInscription(s.id, currentUser.id) ?? (inscrit ? "Désinscription OK" : "Inscription OK"))}
                  className={`px-4 py-2 rounded text-xs font-medium ${inscrit ? "border border-border text-muted-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {inscrit ? "Se désinscrire" : "S'inscrire"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
      {feedback && <p className="text-xs text-muted-foreground">{feedback}</p>}
    </div>
  );
}

export function PageMonEspace() {
  const { currentUser, currentRole, progressionVersSuivant, params, participations, sessions, effectiveScreens, screenLabel } = useMembership();
  const prog = progressionVersSuivant(currentUser);
  const myParts = participations.filter((p) => p.memberId === currentUser.id).slice(0, 8);
  const mySessions = sessions.filter((s) => s.inscrits.includes(currentUser.id));

  return (
    <div className="space-y-6">
      <SectionTitle label="Membre" title="Mon Espace" subtitle="Statut, progression, badges, participations, sessions et privilèges." />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-3">
            <span className="font-display text-2xl font-bold text-primary">{currentUser.avatar}</span>
          </div>
          <h3 className="font-display font-bold uppercase text-foreground">{currentUser.nom}</h3>
          <p className="font-mono text-xs text-primary mt-1">{currentUser.id} · {currentRole.label}</p>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            <StatusBadge statut={currentUser.statut} />
            {currentUser.niveau > 0 && <Badge variant="default">N{currentUser.niveau}</Badge>}
            {currentUser.badgeInvestisseur && <Badge variant="premium">Investisseur</Badge>}
          </div>
          <div className="mt-4 text-left space-y-1">
            {currentUser.fonctions.filter((f) => f.active).map((f) => (
              <Badge key={f.id} variant="info">{FONCTION_LABELS[f.type]} — {f.groupeOuPole}</Badge>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2 space-y-4">
          <div>
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground mb-1">
              <span>{prog.label}</span>
              <span>{prog.current} / {prog.target}</span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${prog.pct}%` }} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-3 bg-secondary/50 rounded border border-border">
              <p className="font-mono text-[10px] text-muted-foreground">Présences</p>
              <p className="font-display text-xl font-bold text-foreground">{currentUser.nbPresences}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded border border-border">
              <p className="font-mono text-[10px] text-muted-foreground">Absences</p>
              <p className="font-display text-xl font-bold text-foreground">{currentUser.nbAbsences}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded border border-border">
              <p className="font-mono text-[10px] text-muted-foreground">Capital</p>
              <p className="font-display text-lg font-bold text-foreground">{currentUser.capitalInvesti.toLocaleString("fr-FR")} F</p>
            </div>
          </div>
          {(currentUser.statut === "confirme" || currentUser.badgeInvestisseur) && (
            <div className="p-3 border border-[#F5D251]/40 bg-[#F5D251]/15 rounded text-xs text-[#0B1B59]">
              Tableau financier complémentaire · engagement Confirmé {params.engagementMensuelConfirmeFcfa.toLocaleString("fr-FR")} FCFA/mois · seuil Investisseur {params.seuilInvestisseurFcfa.toLocaleString("fr-FR")} FCFA
            </div>
          )}
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Privilèges / écrans</p>
            <p className="text-xs text-foreground">{effectiveScreens.map(screenLabel).join(" · ")}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Mes participations récentes</p>
            <div className="space-y-1">
              {myParts.map((p) => (
                <div key={p.id} className="flex justify-between text-xs border-b border-border/40 py-1">
                  <span>{p.titre}</span>
                  <Badge variant={p.present ? "success" : "danger"}>{p.present ? "P" : "A"}</Badge>
                </div>
              ))}
              {!myParts.length && <p className="text-xs text-muted-foreground">Aucune</p>}
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Sessions réservées</p>
            {mySessions.map((s) => <p key={s.id} className="text-xs text-foreground">{s.titre} — {s.date}</p>)}
            {!mySessions.length && <p className="text-xs text-muted-foreground">Non inscrit</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PageParametres() {
  const { params, updateParams } = useMembership();
  return (
    <div className="space-y-6">
      <SectionTitle label="Admin" title="Paramètres de progression" subtitle="Seuils de niveau, rétrogradation, confirmation et gouvernance — maquette mémoire." />
      <Card className="p-5 space-y-4 max-w-xl">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <Field key={n} label={`Participations pour N${n}`}>
            <input
              type="number"
              className={fieldClass}
              value={params.participationsParNiveau[n]}
              onChange={(e) =>
                updateParams({ participationsParNiveau: { ...params.participationsParNiveau, [n]: Number(e.target.value) } })
              }
            />
          </Field>
        ))}
        <Field label="Participations pour Confirmé">
          <input type="number" className={fieldClass} value={params.participationsPourConfirme} onChange={(e) => updateParams({ participationsPourConfirme: Number(e.target.value) })} />
        </Field>
        <Field label="Absences avant rétrogradation">
          <input type="number" className={fieldClass} value={params.absencesAvantRetrogradation} onChange={(e) => updateParams({ absencesAvantRetrogradation: Number(e.target.value) })} />
        </Field>
        <Field label="Présences consécutives pour récupération">
          <input type="number" className={fieldClass} value={params.presencesPourRecuperation} onChange={(e) => updateParams({ presencesPourRecuperation: Number(e.target.value) })} />
        </Field>
        <Field label="Seuil badge Investisseur (FCFA)">
          <input type="number" className={fieldClass} value={params.seuilInvestisseurFcfa} onChange={(e) => updateParams({ seuilInvestisseurFcfa: Number(e.target.value) })} />
        </Field>
        <Field label="Engagement mensuel Confirmé (FCFA)">
          <input type="number" className={fieldClass} value={params.engagementMensuelConfirmeFcfa} onChange={(e) => updateParams({ engagementMensuelConfirmeFcfa: Number(e.target.value) })} />
        </Field>
        <Field label="Niveau min. gouvernance">
          <input type="number" className={fieldClass} value={params.niveauMinGouvernance} onChange={(e) => updateParams({ niveauMinGouvernance: Number(e.target.value) })} />
        </Field>
      </Card>
    </div>
  );
}

export const NAV_ICONS = {
  accueil: Activity,
  membres: Users,
  roles: KeyRound,
  gouvernance: Award,
  participations: TrendingUp,
  sessions: Calendar,
  "mon-espace": UserCheck,
  parametres: Settings,
} as const;
