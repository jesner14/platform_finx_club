import { useEffect, useMemo, useState } from "react";
import {
  Plus, Search, Shield, Check, Users, KeyRound, Award, Activity,
  Calendar, Settings, TrendingUp, UserCheck, X, Eye, Edit, Trash2, Wallet, Upload, LineChart, ArrowDownToLine, PieChart, Briefcase, Layers, Percent, Banknote, Landmark, ClipboardList,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api, ApiError } from "../api";
import { computeEffectiveScreens, useMembership, type HistoriquePath } from "./MembershipContext";
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
  Badge, Card, ConfirmDialog, EmptyState, Field, SectionTitle, Spinner, StatusBadge, WorkTabs, fieldClass, fieldInputClass, roleTone,
} from "./ui";

type VlRow = {
  id: number;
  date: string;
  actifNet: number | null;
  nombreParts: number | null;
  valeur: number;
};

type SoldePage = {
  content: { id: number; date: string; nombreParts: number }[];
  total: number;
  page: number;
  size: number;
  deposited: boolean | null;
  latest: { id: number; date: string; nombreParts: number } | null;
};

function formatFrDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "—";
  const iso = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString("fr-FR");
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("fr-FR");
}

function memberLabel(row: { matricule?: string; nom?: string }) {
  const nom = (row.nom || "").trim();
  const matricule = (row.matricule || "").trim();
  if (!nom || nom === "À compléter") {
    return { matricule: "—", nom: matricule || "À compléter" };
  }
  return { matricule: matricule || "—", nom };
}

function formatMoney(n: number | null | undefined, digits = 2) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type AccueilTableId =
  | "depots"
  | "retraits"
  | "solde"
  | "etat"
  | "vl"
  | "portefeuille"
  | "perfs"
  | "montants"
  | "capitaux";

const ACCUEIL_GROUPS: {
  id: string;
  label: string;
  tabs: { id: AccueilTableId; label: string }[];
}[] = [
  {
    id: "mouvements",
    label: "Mouvements",
    tabs: [
      { id: "depots", label: "Dépôts" },
      { id: "retraits", label: "Retraits" },
    ],
  },
  {
    id: "parts",
    label: "Parts",
    tabs: [
      { id: "solde", label: "Solde de parts" },
      { id: "etat", label: "État des parts" },
      { id: "vl", label: "Valeur liquidative" },
    ],
  },
  {
    id: "portefeuille",
    label: "Portefeuille",
    tabs: [{ id: "portefeuille", label: "Positions" }],
  },
  {
    id: "historiques",
    label: "Historiques",
    tabs: [
      { id: "perfs", label: "Performances" },
      { id: "montants", label: "Montants investis" },
      { id: "capitaux", label: "Capitaux nets" },
    ],
  },
];

function DateToolbar({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} max-w-[11rem]`}
      />
      {value && (
        <button type="button" onClick={() => onChange("")} className="text-[11px] text-muted-foreground underline">
          Effacer
        </button>
      )}
    </>
  );
}

function MemberHistoriqueCard({
  title,
  path,
  formatValue,
  embedded = false,
}: {
  title: string;
  path: HistoriquePath;
  formatValue: (n: number) => string;
  embedded?: boolean;
}) {
  const [date, setDate] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    content: { id: number; date: string; valeur: number }[];
    total: number;
    page: number;
    size: number;
    deposited: boolean | null;
    latest: { id: number; date: string; valeur: number } | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), size: "10" });
    if (date) query.set("date", date);
    api<{
      content: { id: number; date: string; valeur: number }[];
      total: number;
      page: number;
      size: number;
      deposited: boolean | null;
      latest: { id: number; date: string; valeur: number } | null;
    }>(`/api/${path}/me?${query}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, date, page]);

  const body = (
    <>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        {!embedded && (
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex-1">{title}</p>
        )}
        {data?.latest && (
          <div className={embedded ? "mr-auto text-left" : "text-right"}>
            <p className="font-display text-2xl font-bold text-foreground">{formatValue(data.latest.valeur)}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              au {new Date(`${data.latest.date}T00:00:00`).toLocaleDateString("fr-FR")}
            </p>
          </div>
        )}
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(0);
          }}
          className={`${fieldClass} max-w-[11rem]`}
        />
        {date && (
          <button type="button" onClick={() => { setDate(""); setPage(0); }} className="text-[11px] text-muted-foreground underline">
            Effacer
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
          <Spinner className="h-4 w-4" /> Chargement…
        </div>
      ) : date && data?.deposited === false ? (
        <p className="text-xs text-muted-foreground py-4">Aucune valeur à cette date.</p>
      ) : !data?.content.length ? (
        <p className="text-xs text-muted-foreground py-4">Aucun historique enregistré.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Date</th>
                <th className="px-2 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase">Valeur</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((row) => (
                <tr key={row.id} className="border-b border-border/40">
                  <td className="px-2 py-2 font-mono text-xs">{formatFrDate(row.date)}</td>
                  <td className="px-2 py-2 font-mono text-xs text-right">{formatValue(row.valeur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.total > data.size && !date && (
        <div className="flex items-center justify-between mt-3">
          <p className="font-mono text-[10px] text-muted-foreground">{data.total} ligne(s) · page {data.page + 1}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
            <button type="button" disabled={(page + 1) * data.size >= data.total} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}
    </>
  );

  if (embedded) return body;
  return <Card className="p-5">{body}</Card>;
}

export function PageAccueil() {
  const { currentUser, currentRole, params, progressionVersSuivant } = useMembership();
  const prog = progressionVersSuivant(currentUser);
  const stats = [
    { label: "Présences", value: currentUser.nbPresences },
    { label: "Jours d'absence", value: currentUser.nbAbsences },
  ];
  const [depotDate, setDepotDate] = useState("");
  const [depotPage, setDepotPage] = useState(0);
  const [depotLoading, setDepotLoading] = useState(false);
  const [depots, setDepots] = useState<{
    content: { id: number; date: string; montant: number }[];
    total: number;
    page: number;
    size: number;
    deposited: boolean | null;
  } | null>(null);
  const [retraitDate, setRetraitDate] = useState("");
  const [retraitPage, setRetraitPage] = useState(0);
  const [retraitLoading, setRetraitLoading] = useState(false);
  const [retraits, setRetraits] = useState<{
    content: { id: number; date: string; montant: number }[];
    total: number;
    page: number;
    size: number;
    deposited: boolean | null;
  } | null>(null);
  const [soldeDate, setSoldeDate] = useState("");
  const [soldePage, setSoldePage] = useState(0);
  const [soldeLoading, setSoldeLoading] = useState(false);
  const [soldes, setSoldes] = useState<SoldePage | null>(null);
  const [etatPage, setEtatPage] = useState(0);
  const [etatDate, setEtatDate] = useState("");
  const [etatLoading, setEtatLoading] = useState(false);
  const [etats, setEtats] = useState<SoldePage | null>(null);
  const [vlPage, setVlPage] = useState(0);
  const [vlLoading, setVlLoading] = useState(false);
  const [vl, setVl] = useState<VlPage | null>(null);
  const [portPage, setPortPage] = useState(0);
  const [portLoading, setPortLoading] = useState(false);
  const [portefeuille, setPortefeuille] = useState<{
    content: { id: number; symbole: string; titre: string; secteur: string | null }[];
    total: number;
    page: number;
    size: number;
  } | null>(null);
  const [dashTab, setDashTab] = useState<AccueilTableId>("depots");
  const dashGroup = ACCUEIL_GROUPS.find((group) => group.tabs.some((tab) => tab.id === dashTab)) ?? ACCUEIL_GROUPS[0];

  useEffect(() => {
    let cancelled = false;
    setDepotLoading(true);
    const query = new URLSearchParams({ page: String(depotPage), size: "10" });
    if (depotDate) query.set("date", depotDate);
    api<{
      content: { id: number; date: string; montant: number }[];
      total: number;
      page: number;
      size: number;
      deposited: boolean | null;
    }>(`/api/depots/me?${query}`)
      .then((data) => {
        if (!cancelled) setDepots(data);
      })
      .catch(() => {
        if (!cancelled) setDepots(null);
      })
      .finally(() => {
        if (!cancelled) setDepotLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [depotDate, depotPage]);

  useEffect(() => {
    let cancelled = false;
    setRetraitLoading(true);
    const query = new URLSearchParams({ page: String(retraitPage), size: "10" });
    if (retraitDate) query.set("date", retraitDate);
    api<{
      content: { id: number; date: string; montant: number }[];
      total: number;
      page: number;
      size: number;
      deposited: boolean | null;
    }>(`/api/retraits/me?${query}`)
      .then((data) => {
        if (!cancelled) setRetraits(data);
      })
      .catch(() => {
        if (!cancelled) setRetraits(null);
      })
      .finally(() => {
        if (!cancelled) setRetraitLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retraitDate, retraitPage]);

  useEffect(() => {
    let cancelled = false;
    setSoldeLoading(true);
    const query = new URLSearchParams({ page: String(soldePage), size: "10" });
    if (soldeDate) query.set("date", soldeDate);
    api<SoldePage>(`/api/soldes-parts/me?${query}`)
      .then((data) => {
        if (!cancelled) setSoldes(data);
      })
      .catch(() => {
        if (!cancelled) setSoldes(null);
      })
      .finally(() => {
        if (!cancelled) setSoldeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [soldeDate, soldePage]);

  useEffect(() => {
    let cancelled = false;
    setEtatLoading(true);
    const query = new URLSearchParams({ page: String(etatPage), size: "10" });
    if (etatDate) query.set("date", etatDate);
    api<SoldePage>(`/api/etats-parts/me?${query}`)
      .then((data) => {
        if (!cancelled) setEtats(data);
      })
      .catch(() => {
        if (!cancelled) setEtats(null);
      })
      .finally(() => {
        if (!cancelled) setEtatLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [etatDate, etatPage]);

  useEffect(() => {
    let cancelled = false;
    setVlLoading(true);
    api<VlPage>(`/api/valeurs-liquidatives?page=${vlPage}&size=10`)
      .then((data) => {
        if (!cancelled) setVl(data);
      })
      .catch(() => {
        if (!cancelled) setVl(null);
      })
      .finally(() => {
        if (!cancelled) setVlLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vlPage]);

  useEffect(() => {
    let cancelled = false;
    setPortLoading(true);
    api<{
      content: { id: number; symbole: string; titre: string; secteur: string | null }[];
      total: number;
      page: number;
      size: number;
    }>(`/api/portefeuille?page=${portPage}&size=10`)
      .then((data) => {
        if (!cancelled) setPortefeuille(data);
      })
      .catch(() => {
        if (!cancelled) setPortefeuille(null);
      })
      .finally(() => {
        if (!cancelled) setPortLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [portPage]);

  return (
    <div className="space-y-8">
      <div
        className="finx-hero relative overflow-hidden rounded-xl border border-border p-8"
        style={{ background: "linear-gradient(105deg, var(--hero-from), var(--hero-via), var(--hero-to))" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--finx-premium)]" />
        <p className="font-mono text-xs tracking-[0.25em] uppercase mb-2" style={{ color: "var(--hero-muted)" }}>
          FINX CLUB — Membres & statuts
        </p>
        <h2 className="font-display text-4xl font-bold uppercase tracking-wide mb-1" style={{ color: "var(--hero-fg)" }}>
          Bienvenue, {currentUser.nom}
        </h2>
        <p className="text-sm" style={{ color: "var(--hero-muted)" }}>
          {currentRole.label} · {STATUS_LABELS[currentUser.statut]}
          {currentUser.niveau ? ` N${currentUser.niveau}` : ""}
          {currentUser.badgeInvestisseur ? " · Investisseur" : ""}
        </p>
        <div className="mt-5 max-w-md">
          <div className="flex justify-between text-[10px] font-mono mb-1" style={{ color: "var(--hero-muted)" }}>
            <span>{prog.label}</span>
            <span>{prog.current}/{prog.target}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--hero-fg) 14%, transparent)" }}>
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${prog.pct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{s.label}</p>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 pt-4">
          <div className="flex items-end gap-6 overflow-x-auto border-b border-border" role="tablist" aria-label="Sections du tableau de bord">
            {ACCUEIL_GROUPS.map((group) => {
              const active = dashGroup.id === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setDashTab(group.tabs[0].id)}
                  className={`relative shrink-0 pb-3 text-sm font-medium tracking-wide transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {group.label}
                  {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2 py-4">
            {dashGroup.tabs.length > 1 && dashGroup.tabs.map((tab) => {
              const active = dashTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDashTab(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {dashTab === "depots" && (
                <DateToolbar value={depotDate} onChange={(next) => { setDepotDate(next); setDepotPage(0); }} />
              )}
              {dashTab === "retraits" && (
                <DateToolbar value={retraitDate} onChange={(next) => { setRetraitDate(next); setRetraitPage(0); }} />
              )}
              {dashTab === "solde" && (
                <DateToolbar value={soldeDate} onChange={(next) => { setSoldeDate(next); setSoldePage(0); }} />
              )}
              {dashTab === "etat" && (
                <DateToolbar value={etatDate} onChange={(next) => { setEtatDate(next); setEtatPage(0); }} />
              )}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
        {dashTab === "depots" && (
        <>
        {depotLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
            <Spinner className="h-4 w-4" /> Chargement des dépôts…
          </div>
        ) : depotDate && depots?.deposited === false ? (
          <p className="text-xs text-muted-foreground py-4">Aucun dépôt à cette date.</p>
        ) : !depots?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucun dépôt enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Date</th>
                  <th className="px-2 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase">Montant</th>
                </tr>
              </thead>
              <tbody>
                {depots.content.map((d) => (
                  <tr key={d.id} className="border-b border-border/40">
                    <td className="px-2 py-2 font-mono text-xs text-foreground">
                      {new Date(`${d.date}T00:00:00`).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-right text-foreground">
                      {d.montant.toLocaleString("fr-FR")} F
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {depots && depots.total > depots.size && !depotDate && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              {depots.total} dépôt(s) · page {depots.page + 1}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={depotPage <= 0}
                onClick={() => setDepotPage((p) => Math.max(0, p - 1))}
                className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                type="button"
                disabled={(depotPage + 1) * depots.size >= depots.total}
                onClick={() => setDepotPage((p) => p + 1)}
                className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
        </>
        )}

        {dashTab === "retraits" && (
        <>
        {retraitLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
            <Spinner className="h-4 w-4" /> Chargement des retraits…
          </div>
        ) : retraitDate && retraits?.deposited === false ? (
          <p className="text-xs text-muted-foreground py-4">Aucun retrait à cette date.</p>
        ) : !retraits?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucun retrait enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Date</th>
                  <th className="px-2 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase">Montant</th>
                </tr>
              </thead>
              <tbody>
                {retraits.content.map((d) => (
                  <tr key={d.id} className="border-b border-border/40">
                    <td className="px-2 py-2 font-mono text-xs text-foreground">
                      {new Date(`${d.date}T00:00:00`).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-right text-foreground">
                      {d.montant.toLocaleString("fr-FR")} F
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {retraits && retraits.total > retraits.size && !retraitDate && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              {retraits.total} retrait(s) · page {retraits.page + 1}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={retraitPage <= 0} onClick={() => setRetraitPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
              <button type="button" disabled={(retraitPage + 1) * retraits.size >= retraits.total} onClick={() => setRetraitPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
            </div>
          </div>
        )}
        </>
        )}

        {dashTab === "solde" && (
        <>
        {soldes?.latest && (
          <div className="mb-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Solde actuel</p>
            <p className="font-display text-2xl font-bold text-foreground">{formatMoney(soldes.latest.nombreParts, 4)}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              au {new Date(`${soldes.latest.date}T00:00:00`).toLocaleDateString("fr-FR")}
            </p>
          </div>
        )}
        {soldeLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
            <Spinner className="h-4 w-4" /> Chargement des parts…
          </div>
        ) : soldeDate && soldes?.deposited === false ? (
          <p className="text-xs text-muted-foreground py-4">Aucun solde à cette date.</p>
        ) : !soldes?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucun solde de parts enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Date</th>
                  <th className="px-2 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase">Parts</th>
                </tr>
              </thead>
              <tbody>
                {soldes.content.map((d) => (
                  <tr key={d.id} className="border-b border-border/40">
                    <td className="px-2 py-2 font-mono text-xs text-foreground">
                      {new Date(`${d.date}T00:00:00`).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-right text-foreground">
                      {formatMoney(d.nombreParts, 4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {soldes && soldes.total > soldes.size && !soldeDate && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              {soldes.total} solde(s) · page {soldes.page + 1}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={soldePage <= 0} onClick={() => setSoldePage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
              <button type="button" disabled={(soldePage + 1) * soldes.size >= soldes.total} onClick={() => setSoldePage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
            </div>
          </div>
        )}
        </>
        )}

        {dashTab === "etat" && (
        <>
        {etats?.latest && (
          <div className="mb-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Dernier état</p>
            <p className="font-display text-2xl font-bold text-foreground">{formatMoney(etats.latest.nombreParts, 4)}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              au {new Date(`${etats.latest.date}T00:00:00`).toLocaleDateString("fr-FR")}
            </p>
          </div>
        )}
        {etatLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
            <Spinner className="h-4 w-4" /> Chargement de l'état des parts…
          </div>
        ) : etatDate && etats?.deposited === false ? (
          <p className="text-xs text-muted-foreground py-4">Aucun état à cette date.</p>
        ) : !etats?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucun état des parts enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Date</th>
                  <th className="px-2 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase">Parts</th>
                </tr>
              </thead>
              <tbody>
                {etats.content.map((d) => (
                  <tr key={d.id} className="border-b border-border/40">
                    <td className="px-2 py-2 font-mono text-xs text-foreground">
                      {new Date(`${d.date}T00:00:00`).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-right text-foreground">
                      {formatMoney(d.nombreParts, 4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {etats && etats.total > etats.size && !etatDate && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              {etats.total} état(s) · page {etats.page + 1}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={etatPage <= 0} onClick={() => setEtatPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
              <button type="button" disabled={(etatPage + 1) * etats.size >= etats.total} onClick={() => setEtatPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
            </div>
          </div>
        )}
        </>
        )}

        {dashTab === "vl" && (
        <>
        {vl?.latest && (
          <div className="mb-4">
            <p className="font-display text-2xl font-bold text-foreground">{formatMoney(vl.latest.valeur, 4)}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              au {new Date(`${vl.latest.date}T00:00:00`).toLocaleDateString("fr-FR")}
            </p>
          </div>
        )}
        {params.membreVoitToutesValeursLiquidatives ? (
          <>
            {vlLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
                <Spinner className="h-4 w-4" /> Chargement…
              </div>
            ) : !vl?.content.length ? (
              <p className="text-xs text-muted-foreground py-4">Aucune valeur liquidative enregistrée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-2 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Date</th>
                      <th className="px-2 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase">Actif net</th>
                      <th className="px-2 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase">Parts</th>
                      <th className="px-2 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase">VL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vl.content.map((row) => (
                      <tr key={row.id} className="border-b border-border/40">
                        <td className="px-2 py-2 font-mono text-xs">{new Date(`${row.date}T00:00:00`).toLocaleDateString("fr-FR")}</td>
                        <td className="px-2 py-2 font-mono text-xs text-right">{formatMoney(row.actifNet)} F</td>
                        <td className="px-2 py-2 font-mono text-xs text-right">{formatMoney(row.nombreParts, 4)}</td>
                        <td className="px-2 py-2 font-mono text-xs text-right">{formatMoney(row.valeur, 4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {vl && vl.total > vl.size && (
              <div className="flex items-center justify-between mt-3">
                <p className="font-mono text-[10px] text-muted-foreground">{vl.total} valeur(s) · page {vl.page + 1}</p>
                <div className="flex gap-2">
                  <button type="button" disabled={vlPage <= 0} onClick={() => setVlPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
                  <button type="button" disabled={(vlPage + 1) * vl.size >= vl.total} onClick={() => setVlPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {vlLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Spinner className="h-4 w-4" /> Chargement…
              </div>
            )}
            {!vlLoading && !vl?.latest && (
              <p className="text-xs text-muted-foreground py-2">Aucune valeur liquidative enregistrée.</p>
            )}
          </>
        )}
        </>
        )}

        {dashTab === "portefeuille" && (
        <>
        {portLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
            <Spinner className="h-4 w-4" /> Chargement du portefeuille…
          </div>
        ) : !portefeuille?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucune ligne de portefeuille enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Symbole</th>
                  <th className="px-2 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Titre</th>
                  <th className="px-2 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Secteur</th>
                </tr>
              </thead>
              <tbody>
                {portefeuille.content.map((row) => (
                  <tr key={row.id} className="border-b border-border/40">
                    <td className="px-2 py-2 font-mono text-xs text-foreground">{row.symbole}</td>
                    <td className="px-2 py-2 text-xs text-foreground">{row.titre}</td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{row.secteur || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {portefeuille && portefeuille.total > portefeuille.size && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              {portefeuille.total} ligne(s) · page {portefeuille.page + 1}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={portPage <= 0} onClick={() => setPortPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
              <button type="button" disabled={(portPage + 1) * portefeuille.size >= portefeuille.total} onClick={() => setPortPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
            </div>
          </div>
        )}
        </>
        )}

        {dashTab === "perfs" && (
          <MemberHistoriqueCard
            title="Historique des performances"
            path="historiques-performances"
            formatValue={(n) => `${formatMoney(n, 4)} %`}
            embedded
          />
        )}
        {dashTab === "montants" && (
          <MemberHistoriqueCard
            title="Historique des montants investis"
            path="historiques-montants-investis"
            formatValue={(n) => `${formatMoney(n)} F`}
            embedded
          />
        )}
        {dashTab === "capitaux" && (
          <MemberHistoriqueCard
            title="Historique des capitaux nets"
            path="historiques-capitaux-nets"
            formatValue={(n) => `${formatMoney(n)} F`}
            embedded
          />
        )}
        </div>
      </Card>
    </div>
  );
}

export function PageMembres() {
  const { members, roles, addMember, updateMember, removeMember, removeMembers, screenLabel, saving, error } = useMembership();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus>("all");
  const [pendingDelete, setPendingDelete] = useState<Member | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [listPage, setListPage] = useState(0);
  const [modal, setModal] = useState<"create" | "edit" | "view" | "access" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const todayAdhesion = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"matricule" | "nom" | "email" | "username" | "password", string>>>({});
  const [form, setForm] = useState({
    nom: "", email: "", matricule: "", username: "", password: "", statut: "simple" as MemberStatus, niveau: 0,
    roleId: "membre", cotisation: "À jour" as Member["cotisation"],
    capitalInvesti: 0, adhesion: todayAdhesion,
    grantScreens: [] as ScreenKey[], denyScreens: [] as ScreenKey[],
  });

  const selected = members.find((m) => m.id === selectedId);
  const filtered = useMemo(
    () => members.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch = m.nom.toLowerCase().includes(q)
        || m.id.includes(search)
        || (m.matricule ?? "").toLowerCase().includes(q)
        || (m.email ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || m.statut === statusFilter;
      return matchSearch && matchStatus;
    }),
    [members, search, statusFilter],
  );

  const MEMBER_PAGE_SIZE = 10;
  useEffect(() => {
    setListPage(0);
  }, [search, statusFilter]);
  const memberPageCount = Math.max(1, Math.ceil(filtered.length / MEMBER_PAGE_SIZE));
  const memberPage = Math.min(listPage, memberPageCount - 1);
  const pagedMembers = filtered.slice(memberPage * MEMBER_PAGE_SIZE, memberPage * MEMBER_PAGE_SIZE + MEMBER_PAGE_SIZE);
  const pageIds = pagedMembers.map((m) => m.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected = pageIds.some((id) => selectedIds.includes(id));

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const togglePage = () => {
    setSelectedIds((prev) => {
      if (allPageSelected) return prev.filter((id) => !pageIds.includes(id));
      const next = new Set(prev);
      for (const id of pageIds) next.add(id);
      return [...next];
    });
  };

  const openCreate = () => {
    setForm({
      nom: "", email: "", matricule: "", username: "", password: "", statut: "simple", niveau: 0, roleId: roles.find((r) => r.id === "membre")?.id ?? roles[0]?.id ?? "membre",
      cotisation: "À jour", capitalInvesti: 0, adhesion: todayAdhesion,
      grantScreens: [], denyScreens: [],
    });
    setFieldErrors({});
    setFormError(null);
    setModal("create");
  };

  const openEdit = (m: Member) => {
    setSelectedId(m.id);
    setForm({
      nom: m.nom, email: m.email ?? "", matricule: m.matricule ?? "", username: m.username ?? "", password: "", statut: m.statut, niveau: m.niveau, roleId: m.roleId,
      cotisation: m.cotisation, capitalInvesti: m.capitalInvesti, adhesion: m.adhesion,
      grantScreens: [...m.grantScreens], denyScreens: [...m.denyScreens],
    });
    setFieldErrors({});
    setFormError(null);
    setModal("edit");
  };

  const REQUIRED = "Ce champ est obligatoire.";

  const setFormField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "matricule" || key === "nom" || key === "email" || key === "username" || key === "password") {
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const save = async () => {
    const nextErrors: typeof fieldErrors = {};
    if (!form.matricule.trim()) nextErrors.matricule = REQUIRED;
    if (!form.nom.trim()) nextErrors.nom = REQUIRED;
    if (modal === "create") {
      if (!form.email.trim()) nextErrors.email = REQUIRED;
      if (!form.username.trim()) nextErrors.username = REQUIRED;
      if (!form.password.trim()) nextErrors.password = REQUIRED;
      else if (form.password.length < 6) nextErrors.password = "Au moins 6 caractères.";
    } else if (modal === "edit") {
      if (form.username.trim() || form.password.trim()) {
        if (!form.email.trim()) nextErrors.email = REQUIRED;
        if (!form.username.trim()) nextErrors.username = REQUIRED;
        if (!selected?.username) {
          if (!form.password.trim()) nextErrors.password = REQUIRED;
          else if (form.password.length < 6) nextErrors.password = "Au moins 6 caractères.";
        } else if (form.password.trim() && form.password.length < 6) {
          nextErrors.password = "Au moins 6 caractères.";
        }
      }
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFormError(null);
      return;
    }
    let err: string | null = null;
    if (modal === "create") {
      err = await addMember({ ...form, badgeInvestisseur: false, grantScreens: form.grantScreens, denyScreens: form.denyScreens });
    } else if (modal === "edit" && selectedId) {
      const patch: Partial<Member> & { password?: string } = {
        nom: form.nom,
        matricule: form.matricule,
        statut: form.statut,
        niveau: form.niveau,
        roleId: form.roleId,
        cotisation: form.cotisation,
        capitalInvesti: form.capitalInvesti,
        adhesion: form.adhesion,
        grantScreens: form.grantScreens,
        denyScreens: form.denyScreens,
      };
      if (form.email.trim()) patch.email = form.email.trim();
      if (form.username.trim()) patch.username = form.username.trim();
      if (form.password.trim()) patch.password = form.password.trim();
      err = await updateMember(selectedId, patch);
    } else if (modal === "access" && selectedId) {
      err = await updateMember(selectedId, { roleId: form.roleId, grantScreens: form.grantScreens, denyScreens: form.denyScreens });
    }
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
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
      <SectionTitle label="Gestion" title="Membres du Club" subtitle="Statuts, niveaux N1–N5, badge Investisseur et restrictions d'écrans." />
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-secondary border border-border rounded px-3 py-2 flex-1 max-w-xs">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="bg-transparent text-xs w-full focus:outline-none" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | MemberStatus)}
          className="finx-select h-9 px-3 rounded border border-border bg-card text-xs"
        >
          <option value="all">Tous les statuts</option>
          {(Object.keys(STATUS_LABELS) as MemberStatus[]).map((k) => (
            <option key={k} value={k}>{STATUS_LABELS[k]}</option>
          ))}
        </select>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => setPendingBulkDelete(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-600 rounded text-xs font-medium"
          >
            <Trash2 size={13} /> Supprimer ({selectedIds.length})
          </button>
        )}
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium">
          <Plus size={13} /> Nouveau membre
        </button>
      </div>

      {error && !modal && (
        <p className="text-xs text-red-600 bg-red-500/10 border border-red-500/25 rounded-md px-3 py-2">{error}</p>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-[#0B1B59]"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageSelected && !allPageSelected;
                    }}
                    onChange={togglePage}
                    aria-label="Sélectionner la page"
                  />
                </th>
                {["ID", "Matricule", "Membre", "Statut", "Niveau", "Rôle", "Capital", "Présences", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedMembers.map((m) => {
                const role = roles.find((r) => r.id === m.roleId);
                return (
                  <tr key={m.id} className={`border-b border-border/40 hover:bg-secondary/40 ${selectedIds.includes(m.id) ? "bg-secondary/60" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-[#0B1B59]"
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleSelected(m.id)}
                        aria-label={`Sélectionner ${m.nom}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-primary">{m.id}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-foreground">{m.matricule || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center justify-center">{m.avatar}</div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{m.nom}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{m.email || "E-mail à compléter"}</p>
                          {m.username && <p className="font-mono text-[10px] text-primary/80">@{m.username}</p>}
                          {!m.email && <Badge variant="warning">Fiche incomplète</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge statut={m.statut} />
                        {m.pendingInvestorValidation && <Badge variant="warning">Voir Inscription</Badge>}
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
                      <div className="flex gap-2 items-center">
                        <button onClick={() => { setSelectedId(m.id); setModal("view"); }} className="text-muted-foreground hover:text-primary"><Eye size={13} /></button>
                        <button onClick={() => openEdit(m)} className="text-muted-foreground hover:text-foreground"><Edit size={13} /></button>
                        <button onClick={() => { setSelectedId(m.id); setForm({ ...form, roleId: m.roleId, grantScreens: [...m.grantScreens], denyScreens: [...m.denyScreens], nom: m.nom, email: m.email ?? "", matricule: m.matricule ?? "", statut: m.statut, niveau: m.niveau, cotisation: m.cotisation, capitalInvesti: m.capitalInvesti, adhesion: m.adhesion }); setModal("access"); }} className="text-muted-foreground hover:text-primary"><Shield size={13} /></button>
                        <button onClick={() => setPendingDelete(m)} className="text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={10}><EmptyState text="Aucun membre pour le moment. Ajoutez le premier depuis « Nouveau membre »." /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="font-mono text-[10px] text-muted-foreground">
              {filtered.length} membre(s) · page {memberPage + 1}
            </p>
            {filtered.length > MEMBER_PAGE_SIZE && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={memberPage <= 0}
                  onClick={() => setListPage((p) => Math.max(0, p - 1))}
                  className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={(memberPage + 1) * MEMBER_PAGE_SIZE >= filtered.length}
                  onClick={() => setListPage((p) => p + 1)}
                  className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}
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
                  <Field label="Matricule" required error={fieldErrors.matricule}>
                    <input className={fieldInputClass(fieldErrors.matricule)} value={form.matricule} onChange={(e) => setFormField("matricule", e.target.value)} />
                  </Field>
                  <Field label="Nom" required error={fieldErrors.nom}>
                    <input className={fieldInputClass(fieldErrors.nom)} value={form.nom} onChange={(e) => setFormField("nom", e.target.value)} />
                  </Field>
                  <Field label="Email" required={modal === "create" || Boolean(form.username.trim() || form.password.trim())} error={fieldErrors.email}>
                    <input className={fieldInputClass(fieldErrors.email)} value={form.email} onChange={(e) => setFormField("email", e.target.value)} placeholder={modal === "edit" ? "Obligatoire pour créer le compte" : ""} autoComplete="off" />
                  </Field>
                  <Field label="Identifiant de connexion" required={modal === "create" || Boolean(form.username.trim() || form.password.trim())} error={fieldErrors.username}>
                    <input className={fieldInputClass(fieldErrors.username)} value={form.username} onChange={(e) => setFormField("username", e.target.value)} placeholder="ex. jesner.landa" autoComplete="off" name="finx-member-username" />
                  </Field>
                  <Field label={modal === "create" ? "Mot de passe" : "Nouveau mot de passe (optionnel)"} required={modal === "create" || (!selected?.username && Boolean(form.username.trim() || form.password.trim()))} error={fieldErrors.password}>
                    <input className={fieldInputClass(fieldErrors.password)} type="password" value={form.password} onChange={(e) => setFormField("password", e.target.value)} placeholder={modal === "edit" ? "Laisser vide pour conserver" : ""} autoComplete="new-password" name="finx-member-password" />
                  </Field>
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
                    ["Matricule", selected.matricule || "—"],
                    ["Identifiant", selected.username || "—"],
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
              {formError && <p className="text-xs text-red-600">{formError}</p>}
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-3 py-2 text-xs border border-border rounded text-muted-foreground">Fermer</button>
              {modal !== "view" && (
                <button disabled={saving} onClick={() => void save()} className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded font-medium disabled:opacity-60 flex items-center gap-2">
                  {saving && <Spinner className="h-3 w-3" />} Enregistrer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Supprimer le membre"
        message={pendingDelete
          ? `Supprimer ${pendingDelete.nom}${pendingDelete.matricule ? ` (${pendingDelete.matricule})` : ""} ? Cette action est irréversible.`
          : ""}
        busy={saving}
        error={error}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const err = await removeMember(pendingDelete.id);
          if (!err) {
            setSelectedIds((prev) => prev.filter((id) => id !== pendingDelete.id));
            setPendingDelete(null);
          }
        }}
      />
      <ConfirmDialog
        open={pendingBulkDelete}
        title="Supprimer la sélection"
        message={`Supprimer ${selectedIds.length} membre(s) sélectionné(s) ? Cette action est irréversible.`}
        busy={saving}
        error={error}
        onCancel={() => setPendingBulkDelete(false)}
        onConfirm={async () => {
          const err = await removeMembers(selectedIds);
          if (!err) {
            setSelectedIds([]);
            setPendingBulkDelete(false);
          }
        }}
      />
    </div>
  );
}

export function PageRoles() {
  const { roles, updateRoleScreens, addRole, saving } = useMembership();
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id ?? "");
  const [newLabel, setNewLabel] = useState("");
  const selected = roles.find((r) => r.id === selectedRoleId) ?? roles[0];

  useEffect(() => {
    if (!roles.some((r) => r.id === selectedRoleId) && roles[0]) setSelectedRoleId(roles[0].id);
  }, [roles, selectedRoleId]);

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
              disabled={saving}
              onClick={() => { if (!newLabel.trim()) return; void addRole({ label: newLabel.trim(), description: "Rôle personnalisé", tone: "cyan", screens: ["accueil", "mon-espace"] }).then((err) => { if (!err) setNewLabel(""); }); }}
              className="w-full py-1.5 bg-primary text-primary-foreground rounded text-xs disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Spinner className="h-3 w-3" /> : <Plus size={12} />} Ajouter
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
                  <button key={s.key} disabled={saving} onClick={() => {
                    const next = on ? selected.screens.filter((x) => x !== s.key) : [...selected.screens, s.key];
                    void updateRoleScreens(selected.id, next);
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
  const { members, params, nominateFonction, endFonction, saving } = useMembership();
  const [memberId, setMemberId] = useState("");
  const [type, setType] = useState<FonctionType>("secretaire");
  const [groupe, setGroupe] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pendingClose, setPendingClose] = useState<{ memberId: string; fonctionId: string; label: string } | null>(null);

  useEffect(() => {
    if (!members.some((m) => m.id === memberId)) setMemberId(members[0]?.id ?? "");
  }, [members, memberId]);

  const actives = members.flatMap((m) =>
    m.fonctions.filter((f) => f.active).map((f) => ({ member: m, fonction: f })),
  );

  const nominate = async () => {
    if (!memberId) {
      setMsg("Ajoutez un membre avant de nommer une fonction.");
      return;
    }
    const err = await nominateFonction(memberId, {
      type,
      groupeOuPole: groupe,
      dateNomination: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
      dureeMandat: "2 ans",
      responsabilites: `Mandat ${FONCTION_LABELS[type]}`,
    });
    setMsg(err ?? "Nomination enregistrée.");
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
            {!members.length && <option value="">Aucun membre</option>}
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
        <button disabled={saving} onClick={() => void nominate()} className="px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60 flex items-center gap-2">
          {saving && <Spinner className="h-3 w-3" />} Nommer
        </button>
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
            <button
              disabled={saving}
              onClick={() => setPendingClose({
                memberId: member.id,
                fonctionId: fonction.id,
                label: `${FONCTION_LABELS[fonction.type]} de ${member.nom}`,
              })}
              className="text-xs text-red-600 border border-red-500/30 rounded px-2 py-1 disabled:opacity-60"
            >
              Clôturer
            </button>
          </Card>
        ))}
        {!actives.length && <EmptyState text="Aucune fonction de gouvernance active." />}
      </div>
      <ConfirmDialog
        open={!!pendingClose}
        title="Clôturer la fonction"
        message={pendingClose ? `Clôturer ${pendingClose.label} ? Cette action est irréversible.` : ""}
        confirmLabel="Clôturer"
        busy={saving}
        onCancel={() => setPendingClose(null)}
        onConfirm={async () => {
          if (!pendingClose) return;
          await endFonction(pendingClose.memberId, pendingClose.fonctionId);
          setPendingClose(null);
        }}
      />
    </div>
  );
}

export function PageParticipations() {
  const { members, participations, recordParticipation, history, saving } = useMembership();
  const [memberId, setMemberId] = useState("");
  const [type, setType] = useState<ParticipationType>("reunion");
  const [titre, setTitre] = useState("");
  const [present, setPresent] = useState(true);

  useEffect(() => {
    if (!members.some((m) => m.id === memberId)) setMemberId(members[0]?.id ?? "");
  }, [members, memberId]);

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Suivi"
        title="Participations"
        subtitle="Enregistrer présence / absence — déclenche niveaux, rétrogradations et récupérations."
      />
      <Card className="p-5 grid sm:grid-cols-2 gap-3 max-w-3xl">
        <Field label="Membre">
          <select className={fieldClass} value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            {!members.length && <option value="">Aucun membre</option>}
            {members.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </Field>
        <Field label="Type">
          <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value as ParticipationType)}>
            {(Object.keys(PARTICIPATION_LABELS) as ParticipationType[]).map((k) => <option key={k} value={k}>{PARTICIPATION_LABELS[k]}</option>)}
          </select>
        </Field>
        <Field label="Titre activité">
          <input className={fieldClass} value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Réunion mensuelle" />
        </Field>
        <Field label="Résultat">
          <select className={fieldClass} value={present ? "1" : "0"} onChange={(e) => setPresent(e.target.value === "1")}>
            <option value="1">Présent</option>
            <option value="0">Absent</option>
          </select>
        </Field>
        <button
          disabled={saving || !memberId || !titre.trim()}
          onClick={() => void recordParticipation({ memberId, type, titre, present })}
          className="sm:col-span-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving && <Spinner className="h-3 w-3" />} Enregistrer la participation
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
            {!participations.length && <EmptyState text="Aucune participation enregistrée." />}
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
            {!history.length && <EmptyState text="Aucun changement de statut." />}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PageSessions() {
  const { sessions, members, currentUser, toggleSessionInscription, saving } = useMembership();
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Suivi"
        title="Sessions réservées"
        subtitle="Sessions d'information trimestrielles — accès Membres Investisseurs uniquement."
      />
      {!currentUser.badgeInvestisseur && currentUser.id && (
        <Card className="p-4 border-amber-500/30 bg-amber-500/10 text-xs text-amber-800">
          Vous n'avez pas le badge Investisseur. L'inscription aux sessions réservées n'est pas disponible.
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
                  disabled={saving || !currentUser.id}
                  onClick={async () => {
                    const err = await toggleSessionInscription(s.id, currentUser.id);
                    setFeedback(err ?? (inscrit ? "Désinscription enregistrée." : "Inscription enregistrée."));
                  }}
                  className={`px-4 py-2 rounded text-xs font-medium disabled:opacity-60 flex items-center gap-2 ${inscrit ? "border border-border text-muted-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {saving && <Spinner className="h-3 w-3" />}
                  {inscrit ? "Se désinscrire" : "S'inscrire"}
                </button>
              </div>
            </Card>
          );
        })}
        {!sessions.length && <EmptyState text="Aucune session réservée pour le moment." />}
      </div>
      {feedback && <p className="text-xs text-muted-foreground">{feedback}</p>}
    </div>
  );
}

export function PageMonEspace() {
  const { currentUser, currentRole, progressionVersSuivant, params, participations, sessions, effectiveScreens, screenLabel, updateMyProfile, saving } = useMembership();
  const prog = progressionVersSuivant(currentUser);
  const myParts = participations.filter((p) => p.memberId === currentUser.id).slice(0, 8);
  const mySessions = sessions.filter((s) => s.inscrits.includes(currentUser.id));
  const [profile, setProfile] = useState({ nom: "", email: "", username: "", password: "" });
  const [profileErrors, setProfileErrors] = useState<Partial<Record<"nom" | "email" | "username" | "password", string>>>({});
  const [profileOk, setProfileOk] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  useEffect(() => {
    setProfile({
      nom: currentUser.nom ?? "",
      email: currentUser.email ?? "",
      username: currentUser.username ?? "",
      password: "",
    });
  }, [currentUser.id, currentUser.nom, currentUser.email, currentUser.username]);

  const saveProfile = async () => {
    const errors: Partial<Record<"nom" | "email" | "username" | "password", string>> = {};
    if (!profile.nom.trim()) errors.nom = "Ce champ est obligatoire";
    if (!profile.email.trim()) errors.email = "Ce champ est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) errors.email = "E-mail invalide";
    if (profile.username.trim() && !/^[a-zA-Z0-9._-]{3,32}$/.test(profile.username.trim())) {
      errors.username = "3 à 32 caractères (lettres, chiffres, point, _ ou -)";
    }
    if (profile.password && profile.password.length < 6) errors.password = "Au moins 6 caractères";
    setProfileErrors(errors);
    setProfileOk(null);
    setProfileErr(null);
    if (Object.keys(errors).length) return;
    const err = await updateMyProfile({
      nom: profile.nom.trim(),
      email: profile.email.trim(),
      username: profile.username.trim(),
      password: profile.password || undefined,
    });
    if (err) {
      setProfileErr(err);
      return;
    }
    setProfile((prev) => ({ ...prev, password: "" }));
    setProfileOk("Informations enregistrées.");
  };

  return (
    <div className="space-y-6">
      <SectionTitle label="Membre" title="Mon Espace" subtitle="Consultez votre parcours et mettez à jour vos informations personnelles." />
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
      <Card className="p-5 space-y-4 max-w-xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Informations personnelles</p>
        <p className="text-xs text-muted-foreground">Modifiez votre nom, e-mail et identifiant de connexion. L’ID et le matricule ne peuvent pas être changés ici.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="ID">
            <input className={fieldClass} value={currentUser.id || "—"} disabled />
          </Field>
          <Field label="Matricule">
            <input className={fieldClass} value={currentUser.matricule || "—"} disabled />
          </Field>
        </div>
        <Field label="Nom" required error={profileErrors.nom}>
          <input
            className={fieldInputClass(profileErrors.nom)}
            value={profile.nom}
            onChange={(e) => {
              setProfile((prev) => ({ ...prev, nom: e.target.value }));
              setProfileErrors((prev) => ({ ...prev, nom: undefined }));
              setProfileOk(null);
            }}
          />
        </Field>
        <Field label="E-mail" required error={profileErrors.email}>
          <input
            type="email"
            className={fieldInputClass(profileErrors.email)}
            value={profile.email}
            autoComplete="email"
            onChange={(e) => {
              setProfile((prev) => ({ ...prev, email: e.target.value }));
              setProfileErrors((prev) => ({ ...prev, email: undefined }));
              setProfileOk(null);
            }}
          />
        </Field>
        <Field label="Identifiant de connexion" error={profileErrors.username}>
          <input
            className={fieldInputClass(profileErrors.username)}
            value={profile.username}
            autoComplete="username"
            placeholder="ex. awa.diallo"
            onChange={(e) => {
              setProfile((prev) => ({ ...prev, username: e.target.value }));
              setProfileErrors((prev) => ({ ...prev, username: undefined }));
              setProfileOk(null);
            }}
          />
        </Field>
        <Field label="Nouveau mot de passe (optionnel)" error={profileErrors.password}>
          <input
            type="password"
            className={fieldInputClass(profileErrors.password)}
            value={profile.password}
            autoComplete="new-password"
            placeholder="Laisser vide pour conserver"
            onChange={(e) => {
              setProfile((prev) => ({ ...prev, password: e.target.value }));
              setProfileErrors((prev) => ({ ...prev, password: undefined }));
              setProfileOk(null);
            }}
          />
        </Field>
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveProfile()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60"
        >
          {saving ? <Spinner className="h-3 w-3" /> : <Edit size={13} />} Enregistrer
        </button>
        {profileOk && <p className="text-xs text-emerald-700">{profileOk}</p>}
        {profileErr && <p className="text-xs text-red-600">{profileErr}</p>}
      </Card>
    </div>
  );
}

export function PageParametres() {
  const { params, updateParams, saving } = useMembership();
  const [draft, setDraft] = useState(params);
  useEffect(() => setDraft(params), [params]);
  return (
    <div className="space-y-6">
      <SectionTitle label="Admin" title="Paramètres de progression" subtitle="Seuils de niveau, rétrogradation, confirmation et gouvernance." />
      <Card className="p-5 space-y-4 max-w-xl">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <Field key={n} label={`Participations pour N${n}`}>
            <input
              type="number"
              className={fieldClass}
              value={draft.participationsParNiveau[n]}
              onChange={(e) =>
                setDraft((p) => ({ ...p, participationsParNiveau: { ...p.participationsParNiveau, [n]: Number(e.target.value) } }))
              }
            />
          </Field>
        ))}
        <Field label="Participations pour Confirmé">
          <input type="number" className={fieldClass} value={draft.participationsPourConfirme} onChange={(e) => setDraft({ ...draft, participationsPourConfirme: Number(e.target.value) })} />
        </Field>
        <Field label="Absences avant rétrogradation">
          <input type="number" className={fieldClass} value={draft.absencesAvantRetrogradation} onChange={(e) => setDraft({ ...draft, absencesAvantRetrogradation: Number(e.target.value) })} />
        </Field>
        <Field label="Présences consécutives pour récupération">
          <input type="number" className={fieldClass} value={draft.presencesPourRecuperation} onChange={(e) => setDraft({ ...draft, presencesPourRecuperation: Number(e.target.value) })} />
        </Field>
        <Field label="Seuil badge Investisseur (FCFA)">
          <input type="number" className={fieldClass} value={draft.seuilInvestisseurFcfa} onChange={(e) => setDraft({ ...draft, seuilInvestisseurFcfa: Number(e.target.value) })} />
        </Field>
        <Field label="Engagement mensuel Confirmé (FCFA)">
          <input type="number" className={fieldClass} value={draft.engagementMensuelConfirmeFcfa} onChange={(e) => setDraft({ ...draft, engagementMensuelConfirmeFcfa: Number(e.target.value) })} />
        </Field>
        <Field label="Niveau min. gouvernance">
          <input type="number" className={fieldClass} value={draft.niveauMinGouvernance} onChange={(e) => setDraft({ ...draft, niveauMinGouvernance: Number(e.target.value) })} />
        </Field>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[#0B1B59]"
            checked={Boolean(draft.membreVoitToutesValeursLiquidatives)}
            onChange={(e) => setDraft({ ...draft, membreVoitToutesValeursLiquidatives: e.target.checked })}
          />
          <span>
            <span className="block font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Valeur liquidative côté membre</span>
            <span className="block text-xs text-foreground mt-1">
              Coché : le membre voit tout l’historique. Décoché : uniquement la dernière valeur.
            </span>
          </span>
        </label>
        <button
          disabled={saving}
          onClick={() => void updateParams(draft)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60 flex items-center gap-2"
        >
          {saving && <Spinner className="h-3 w-3" />} Enregistrer
        </button>
      </Card>
    </div>
  );
}

export function PageDepots() {
  const { importDepots, createDepot, deleteAllDepots, saving, members } = useMembership();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<{
    membersCreated: number;
    membersMatched: number;
    depositsUpserted: number;
    createdMatricules: string[];
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterMemberId, setFilterMemberId] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const todayIso = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const [manual, setManual] = useState({ memberId: "", date: todayIso, montant: "" });
  const [manualErrors, setManualErrors] = useState<Partial<Record<"memberId" | "date" | "montant", string>>>({});
  const [manualOk, setManualOk] = useState<string | null>(null);
  const [depots, setDepots] = useState<{
    content: {
      memberId: string;
      matricule: string;
      nom: string;
      totalMontant: number;
      depotCount: number;
      deposits: { id: number; date: string; montant: number }[];
    }[];
    total: number;
    page: number;
    size: number;
    depositTotal: number;
  } | null>(null);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    const query = new URLSearchParams({ page: String(page), size: "10" });
    if (filterDate) query.set("date", filterDate);
    if (filterMemberId) query.set("memberId", filterMemberId);
    api<{
      content: {
        memberId: string;
        matricule: string;
        nom: string;
        totalMontant: number;
        depotCount: number;
        deposits: { id: number; date: string; montant: number }[];
      }[];
      total: number;
      page: number;
      size: number;
      depositTotal: number;
    }>(`/api/admin/depots?${query}`)
      .then((data) => {
        if (!cancelled) setDepots(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setDepots(null);
          setListError(err instanceof ApiError ? err.message : "Impossible de charger les dépôts.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterDate, filterMemberId, page, reloadKey]);

  const membersSorted = useMemo(
    () => [...members].sort((a, b) => (a.matricule || a.nom).localeCompare(b.matricule || b.nom, "fr")),
    [members],
  );

  const submitManual = async () => {
    const errors: Partial<Record<"memberId" | "date" | "montant", string>> = {};
    if (!manual.memberId) errors.memberId = "Ce champ est obligatoire";
    if (!manual.date) errors.date = "Ce champ est obligatoire";
    const amount = Number(String(manual.montant).replace(/\s/g, "").replace(",", "."));
    if (!manual.montant.trim()) errors.montant = "Ce champ est obligatoire";
    else if (!Number.isFinite(amount) || amount <= 0) errors.montant = "Le montant doit être supérieur à 0";
    setManualErrors(errors);
    setManualOk(null);
    if (Object.keys(errors).length) return;
    const err = await createDepot({ memberId: manual.memberId, date: manual.date, montant: Math.round(amount) });
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setManualOk("Dépôt enregistré. Il apparaît dans l’historique du membre.");
    setManual((prev) => ({ ...prev, montant: "" }));
    setFilterMemberId(manual.memberId);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const submit = async () => {
    if (!file) return;
    setLocalError(null);
    const result = await importDepots(file);
    if (result.error) {
      setReport(null);
      setLocalError(result.error);
      return;
    }
    setReport(result.report);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const clearAll = async () => {
    const result = await deleteAllDepots();
    setConfirmClear(false);
    if (result.error) {
      setLocalError(result.error);
      return;
    }
    setReport(null);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Admin"
        title="Dépôts"
        subtitle="Enregistrez un dépôt à la main (membre, date, montant) ou importez un Excel. Un membre peut avoir plusieurs dépôts, un par date."
      />
      <WorkTabs
        initial="list"
        items={[
          {
            id: "create",
            label: "Saisie",
            content: (
              <div className="space-y-4 max-w-3xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nouveau dépôt</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Membre" required error={manualErrors.memberId}>
            <select
              className={fieldInputClass(manualErrors.memberId)}
              value={manual.memberId}
              onChange={(e) => {
                setManual((prev) => ({ ...prev, memberId: e.target.value }));
                setManualErrors((prev) => ({ ...prev, memberId: undefined }));
                setManualOk(null);
              }}
            >
              <option value="">Sélectionner un membre</option>
              {membersSorted.map((m) => (
                <option key={m.id} value={m.id}>
                  {(m.matricule || "—") + " · " + m.nom}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date" required error={manualErrors.date}>
            <input
              type="date"
              className={fieldInputClass(manualErrors.date)}
              value={manual.date}
              onChange={(e) => {
                setManual((prev) => ({ ...prev, date: e.target.value }));
                setManualErrors((prev) => ({ ...prev, date: undefined }));
                setManualOk(null);
              }}
            />
          </Field>
          <Field label="Montant (F)" required error={manualErrors.montant}>
            <input
              type="number"
              min={1}
              step={1}
              className={fieldInputClass(manualErrors.montant)}
              value={manual.montant}
              placeholder="0"
              onChange={(e) => {
                setManual((prev) => ({ ...prev, montant: e.target.value }));
                setManualErrors((prev) => ({ ...prev, montant: undefined }));
                setManualOk(null);
              }}
            />
          </Field>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void submitManual()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60"
        >
          {saving ? <Spinner className="h-3 w-3" /> : <Plus size={13} />} Enregistrer le dépôt
        </button>
        {manualOk && <p className="text-xs text-emerald-700">{manualOk}</p>}
        {localError && !file && <p className="text-xs text-red-600">{localError}</p>}
              </div>
            ),
          },
          {
            id: "list",
            label: "Historique",
            content: (
              <>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Field label="Date">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setPage(0);
              }}
              className={`${fieldClass} max-w-[12rem]`}
            />
          </Field>
          <Field label="Membre">
            <select
              value={filterMemberId}
              onChange={(e) => {
                setFilterMemberId(e.target.value);
                setPage(0);
              }}
              className={`${fieldClass} min-w-[16rem]`}
            >
              <option value="">Tous les membres</option>
              {membersSorted.map((m) => (
                <option key={m.id} value={m.id}>
                  {(m.matricule || "—") + " · " + m.nom}
                </option>
              ))}
            </select>
          </Field>
          {(filterDate || filterMemberId) && (
            <button
              type="button"
              onClick={() => {
                setFilterDate("");
                setFilterMemberId("");
                setPage(0);
              }}
              className="text-[11px] text-muted-foreground underline pb-2"
            >
              Réinitialiser
            </button>
          )}
          {isSuperAdmin && (
            <button
              type="button"
              disabled={saving || !depots?.depositTotal}
              onClick={() => setConfirmClear(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs border border-red-500/30 text-red-600 rounded disabled:opacity-40"
            >
              <Trash2 size={13} /> Supprimer tous les dépôts
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6">
            <Spinner className="h-4 w-4" /> Chargement des dépôts…
          </div>
        ) : listError ? (
          <p className="text-xs text-red-600 py-4">{listError}</p>
        ) : !depots?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucun dépôt pour ces critères.</p>
        ) : (
          <div className="space-y-4">
            {depots.content.map((group) => (
              <div key={group.memberId} className="border border-border rounded-lg overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-secondary/50 border-b border-border">
                  <p className="text-xs font-medium text-foreground">{group.nom}</p>
                  <p className="font-mono text-[10px] text-primary">{group.matricule || "—"}</p>
                  <p className="font-mono text-[10px] text-muted-foreground ml-auto">
                    {group.depotCount} dépôt{group.depotCount > 1 ? "s" : ""} · {group.totalMontant.toLocaleString("fr-FR")} F
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Date</th>
                        <th className="px-3 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.deposits.map((d) => (
                        <tr key={d.id} className="border-b border-border/40">
                          <td className="px-3 py-1.5 font-mono text-xs text-foreground">
                            {new Date(`${d.date}T00:00:00`).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-xs text-right text-foreground">
                            {d.montant.toLocaleString("fr-FR")} F
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
        {depots && depots.total > 0 && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              {depots.depositTotal} dépôt(s) · {depots.total} membre(s) · page {depots.page + 1}
            </p>
            {depots.total > depots.size && (
              <div className="flex gap-2">
                <button type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">
                  Précédent
                </button>
                <button type="button" disabled={(page + 1) * depots.size >= depots.total} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}
              </>
            ),
          },
          {
            id: "import",
            label: "Import",
            hidden: !isSuperAdmin,
            content: (
              <div className="space-y-4 max-w-xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Import Excel</p>
        <Field label="Fichier Excel">
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={!isSuperAdmin || saving}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setReport(null);
              setLocalError(null);
            }}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs"
          />
        </Field>
        <button
          type="button"
          disabled={!isSuperAdmin || saving || !file}
          onClick={() => void submit()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60"
        >
          {saving ? <Spinner className="h-3 w-3" /> : <Upload size={13} />} Importer
        </button>
        {localError && <p className="text-xs text-red-600">{localError}</p>}
        {report && (
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-1 text-xs">
            <p className="font-medium text-foreground">Import terminé</p>
            <p className="text-muted-foreground">{report.depositsUpserted} dépôt(s) enregistré(s)</p>
            <p className="text-muted-foreground">{report.membersMatched} matricule(s) existant(s)</p>
            <p className="text-muted-foreground">{report.membersCreated} membre(s) créé(s) (fiches à compléter)</p>
            {report.createdMatricules.length > 0 && (
              <p className="font-mono text-[10px] text-primary break-all">
                {report.createdMatricules.join(" · ")}
              </p>
            )}
          </div>
        )}
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Supprimer tous les dépôts"
        message="Supprimer tous les dépôts de tous les membres ? Cette action est irréversible."
        busy={saving}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}

export function PageRetraits() {
  const { importRetraits, createRetrait, deleteAllRetraits, saving, members } = useMembership();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<{
    membersCreated: number;
    membersMatched: number;
    depositsUpserted: number;
    createdMatricules: string[];
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterMemberId, setFilterMemberId] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [manual, setManual] = useState({ memberId: "", date: todayIso(), montant: "" });
  const [manualErrors, setManualErrors] = useState<Partial<Record<"memberId" | "date" | "montant", string>>>({});
  const [manualOk, setManualOk] = useState<string | null>(null);
  const [retraits, setRetraits] = useState<{
    content: {
      memberId: string;
      matricule: string;
      nom: string;
      totalMontant: number;
      depotCount: number;
      deposits: { id: number; date: string; montant: number }[];
    }[];
    total: number;
    page: number;
    size: number;
    depositTotal: number;
  } | null>(null);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    const query = new URLSearchParams({ page: String(page), size: "10" });
    if (filterDate) query.set("date", filterDate);
    if (filterMemberId) query.set("memberId", filterMemberId);
    api<{
      content: {
        memberId: string;
        matricule: string;
        nom: string;
        totalMontant: number;
        depotCount: number;
        deposits: { id: number; date: string; montant: number }[];
      }[];
      total: number;
      page: number;
      size: number;
      depositTotal: number;
    }>(`/api/admin/retraits?${query}`)
      .then((data) => {
        if (!cancelled) setRetraits(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setRetraits(null);
          setListError(err instanceof ApiError ? err.message : "Impossible de charger les retraits.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterDate, filterMemberId, page, reloadKey]);

  const membersSorted = useMemo(
    () => [...members].sort((a, b) => (a.matricule || a.nom).localeCompare(b.matricule || b.nom, "fr")),
    [members],
  );

  const submitManual = async () => {
    const errors: Partial<Record<"memberId" | "date" | "montant", string>> = {};
    if (!manual.memberId) errors.memberId = "Ce champ est obligatoire";
    if (!manual.date) errors.date = "Ce champ est obligatoire";
    const amount = Number(String(manual.montant).replace(/\s/g, "").replace(",", "."));
    if (!manual.montant.trim()) errors.montant = "Ce champ est obligatoire";
    else if (!Number.isFinite(amount) || amount <= 0) errors.montant = "Le montant doit être supérieur à 0";
    setManualErrors(errors);
    setManualOk(null);
    if (Object.keys(errors).length) return;
    const err = await createRetrait({ memberId: manual.memberId, date: manual.date, montant: Math.round(amount) });
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setManualOk("Retrait enregistré. Il apparaît dans l’historique du membre.");
    setManual((prev) => ({ ...prev, montant: "" }));
    setFilterMemberId(manual.memberId);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const submit = async () => {
    if (!file) return;
    setLocalError(null);
    const result = await importRetraits(file);
    if (result.error) {
      setReport(null);
      setLocalError(result.error);
      return;
    }
    setReport(result.report);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const clearAll = async () => {
    const result = await deleteAllRetraits();
    setConfirmClear(false);
    if (result.error) {
      setLocalError(result.error);
      return;
    }
    setReport(null);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Admin"
        title="Retraits"
        subtitle="Enregistrez un retrait à la main (membre, date, montant) ou importez un Excel. Un membre peut avoir plusieurs retraits, un par date."
      />
      <WorkTabs
        initial="list"
        items={[
          {
            id: "create",
            label: "Saisie",
            content: (
              <div className="space-y-4 max-w-3xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nouveau retrait</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Membre" required error={manualErrors.memberId}>
            <select className={fieldInputClass(manualErrors.memberId)} value={manual.memberId} onChange={(e) => { setManual((prev) => ({ ...prev, memberId: e.target.value })); setManualErrors((prev) => ({ ...prev, memberId: undefined })); setManualOk(null); }}>
              <option value="">Sélectionner un membre</option>
              {membersSorted.map((m) => (
                <option key={m.id} value={m.id}>{(m.matricule || "—") + " · " + m.nom}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" required error={manualErrors.date}>
            <input type="date" className={fieldInputClass(manualErrors.date)} value={manual.date} onChange={(e) => { setManual((prev) => ({ ...prev, date: e.target.value })); setManualErrors((prev) => ({ ...prev, date: undefined })); setManualOk(null); }} />
          </Field>
          <Field label="Montant (F)" required error={manualErrors.montant}>
            <input type="number" min={1} step={1} className={fieldInputClass(manualErrors.montant)} value={manual.montant} placeholder="0" onChange={(e) => { setManual((prev) => ({ ...prev, montant: e.target.value })); setManualErrors((prev) => ({ ...prev, montant: undefined })); setManualOk(null); }} />
          </Field>
        </div>
        <button type="button" disabled={saving} onClick={() => void submitManual()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Plus size={13} />} Enregistrer le retrait
        </button>
        {manualOk && <p className="text-xs text-emerald-700">{manualOk}</p>}
        {localError && !file && <p className="text-xs text-red-600">{localError}</p>}
              </div>
            ),
          },
          {
            id: "list",
            label: "Historique",
            content: (
              <>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Field label="Date">
            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(0); }} className={`${fieldClass} max-w-[12rem]`} />
          </Field>
          <Field label="Membre">
            <select value={filterMemberId} onChange={(e) => { setFilterMemberId(e.target.value); setPage(0); }} className={`${fieldClass} min-w-[16rem]`}>
              <option value="">Tous les membres</option>
              {membersSorted.map((m) => (
                <option key={m.id} value={m.id}>{(m.matricule || "—") + " · " + m.nom}</option>
              ))}
            </select>
          </Field>
          {(filterDate || filterMemberId) && (
            <button type="button" onClick={() => { setFilterDate(""); setFilterMemberId(""); setPage(0); }} className="text-[11px] text-muted-foreground underline pb-2">Réinitialiser</button>
          )}
          {isSuperAdmin && (
            <button type="button" disabled={saving || !retraits?.depositTotal} onClick={() => setConfirmClear(true)} className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs border border-red-500/30 text-red-600 rounded disabled:opacity-40">
              <Trash2 size={13} /> Supprimer tous les retraits
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6"><Spinner className="h-4 w-4" /> Chargement des retraits…</div>
        ) : listError ? (
          <p className="text-xs text-red-600 py-4">{listError}</p>
        ) : !retraits?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucun retrait pour ces critères.</p>
        ) : (
          <div className="space-y-4">
            {retraits.content.map((group) => (
              <div key={group.memberId} className="border border-border rounded-lg overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-secondary/50 border-b border-border">
                  <p className="text-xs font-medium text-foreground">{group.nom}</p>
                  <p className="font-mono text-[10px] text-primary">{group.matricule || "—"}</p>
                  <p className="font-mono text-[10px] text-muted-foreground ml-auto">
                    {group.depotCount} retrait{group.depotCount > 1 ? "s" : ""} · {group.totalMontant.toLocaleString("fr-FR")} F
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Date</th>
                        <th className="px-3 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.deposits.map((d) => (
                        <tr key={d.id} className="border-b border-border/40">
                          <td className="px-3 py-1.5 font-mono text-xs">{new Date(`${d.date}T00:00:00`).toLocaleDateString("fr-FR")}</td>
                          <td className="px-3 py-1.5 font-mono text-xs text-right">{d.montant.toLocaleString("fr-FR")} F</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
        {retraits && retraits.total > 0 && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">{retraits.depositTotal} retrait(s) · {retraits.total} membre(s) · page {retraits.page + 1}</p>
            {retraits.total > retraits.size && (
              <div className="flex gap-2">
                <button type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
                <button type="button" disabled={(page + 1) * retraits.size >= retraits.total} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
              </div>
            )}
          </div>
        )}
              </>
            ),
          },
          {
            id: "import",
            label: "Import",
            hidden: !isSuperAdmin,
            content: (
              <div className="space-y-4 max-w-xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Import Excel</p>
        <Field label="Fichier Excel">
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={!isSuperAdmin || saving}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setReport(null);
              setLocalError(null);
            }}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs"
          />
        </Field>
        <button type="button" disabled={!isSuperAdmin || saving || !file} onClick={() => void submit()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Upload size={13} />} Importer
        </button>
        {localError && <p className="text-xs text-red-600">{localError}</p>}
        {report && (
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-1 text-xs">
            <p className="font-medium text-foreground">Import terminé</p>
            <p className="text-muted-foreground">{report.depositsUpserted} retrait(s) enregistré(s)</p>
            <p className="text-muted-foreground">{report.membersMatched} membre(s) existant(s)</p>
            <p className="text-muted-foreground">{report.membersCreated} membre(s) créé(s) (fiches à compléter)</p>
            {report.createdMatricules.length > 0 && (
              <p className="font-mono text-[10px] text-primary break-all">{report.createdMatricules.join(" · ")}</p>
            )}
          </div>
        )}
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Supprimer tous les retraits"
        message="Supprimer tous les retraits de tous les membres ? Cette action est irréversible."
        busy={saving}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}

export function PageSoldesParts() {
  const { importSoldesParts, createSoldePart, deleteAllSoldesParts, saving, members } = useMembership();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<{
    membersCreated: number;
    membersMatched: number;
    depositsUpserted: number;
    createdMatricules: string[];
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [manual, setManual] = useState({ memberId: "", date: todayIso(), nombreParts: "" });
  const [manualErrors, setManualErrors] = useState<Partial<Record<"memberId" | "date" | "nombreParts", string>>>({});
  const [manualOk, setManualOk] = useState<string | null>(null);
  const [soldes, setSoldes] = useState<{
    content: {
      id: number;
      date: string;
      nombreParts: number;
      memberId: string;
      matricule: string;
      nom: string;
    }[];
    total: number;
    page: number;
    size: number;
  } | null>(null);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    const query = new URLSearchParams({ page: String(page), size: "10" });
    if (filterDate) query.set("date", filterDate);
    api<{
      content: {
        id: number;
        date: string;
        nombreParts: number;
        memberId: string;
        matricule: string;
        nom: string;
      }[];
      total: number;
      page: number;
      size: number;
    }>(`/api/admin/soldes-parts?${query}`)
      .then((data) => {
        if (!cancelled) {
          setSoldes({
            content: (data.content ?? []).slice(0, 10),
            total: data.total,
            page: data.page,
            size: 10,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSoldes(null);
          setListError(err instanceof ApiError ? err.message : "Impossible de charger les soldes.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterDate, page, reloadKey]);

  const membersSorted = useMemo(
    () => [...members].sort((a, b) => (a.matricule || a.nom).localeCompare(b.matricule || b.nom, "fr")),
    [members],
  );

  const submitManual = async () => {
    const errors: Partial<Record<"memberId" | "date" | "nombreParts", string>> = {};
    if (!manual.memberId) errors.memberId = "Ce champ est obligatoire";
    if (!manual.date) errors.date = "Ce champ est obligatoire";
    const parts = Number(String(manual.nombreParts).replace(/\s/g, "").replace(",", "."));
    if (!manual.nombreParts.trim()) errors.nombreParts = "Ce champ est obligatoire";
    else if (!Number.isFinite(parts) || parts <= 0) errors.nombreParts = "Le nombre de parts doit être supérieur à 0";
    setManualErrors(errors);
    setManualOk(null);
    if (Object.keys(errors).length) return;
    const err = await createSoldePart({ memberId: manual.memberId, date: manual.date, nombreParts: parts });
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setManualOk("Solde enregistré. Il apparaît dans l’historique du membre.");
    setManual((prev) => ({ ...prev, nombreParts: "" }));
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const submit = async () => {
    if (!file) return;
    setLocalError(null);
    const result = await importSoldesParts(file);
    if (result.error) {
      setReport(null);
      setLocalError(result.error);
      return;
    }
    setReport(result.report);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const clearAll = async () => {
    const result = await deleteAllSoldesParts();
    setConfirmClear(false);
    if (result.error) {
      setLocalError(result.error);
      return;
    }
    setReport(null);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Admin"
        title="Solde des parts"
        subtitle="Filtrez par date. 10 lignes par page. Chaque membre voit son historique dans son espace."
      />
      <Card className="p-5 space-y-4 max-w-3xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nouveau solde</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Membre" required error={manualErrors.memberId}>
            <select className={fieldInputClass(manualErrors.memberId)} value={manual.memberId} onChange={(e) => { setManual((prev) => ({ ...prev, memberId: e.target.value })); setManualErrors((prev) => ({ ...prev, memberId: undefined })); setManualOk(null); }}>
              <option value="">Sélectionner un membre</option>
              {membersSorted.map((m) => (
                <option key={m.id} value={m.id}>{(m.matricule || "—") + " · " + m.nom}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" required error={manualErrors.date}>
            <input type="date" className={fieldInputClass(manualErrors.date)} value={manual.date} onChange={(e) => { setManual((prev) => ({ ...prev, date: e.target.value })); setManualErrors((prev) => ({ ...prev, date: undefined })); setManualOk(null); }} />
          </Field>
          <Field label="Nombre de parts" required error={manualErrors.nombreParts}>
            <input type="number" min={0} step="0.0001" className={fieldInputClass(manualErrors.nombreParts)} value={manual.nombreParts} placeholder="0" onChange={(e) => { setManual((prev) => ({ ...prev, nombreParts: e.target.value })); setManualErrors((prev) => ({ ...prev, nombreParts: undefined })); setManualOk(null); }} />
          </Field>
        </div>
        <button type="button" disabled={saving} onClick={() => void submitManual()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Plus size={13} />} Enregistrer le solde
        </button>
        {manualOk && <p className="text-xs text-emerald-700">{manualOk}</p>}
        {localError && !file && <p className="text-xs text-red-600">{localError}</p>}
      </Card>
      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Field label="Date">
            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(0); }} className={`${fieldClass} max-w-[12rem]`} />
          </Field>
          {filterDate && (
            <button type="button" onClick={() => { setFilterDate(""); setPage(0); }} className="text-[11px] text-muted-foreground underline pb-2">Réinitialiser</button>
          )}
          {isSuperAdmin && (
            <button type="button" disabled={saving || !soldes?.total} onClick={() => setConfirmClear(true)} className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs border border-red-500/30 text-red-600 rounded disabled:opacity-40">
              <Trash2 size={13} /> Supprimer tous les soldes
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6"><Spinner className="h-4 w-4" /> Chargement des soldes…</div>
        ) : listError ? (
          <p className="text-xs text-red-600 py-4">{listError}</p>
        ) : !soldes?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucun solde pour ces critères.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Date</th>
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">ID</th>
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Membre</th>
                  <th className="px-3 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Parts</th>
                </tr>
              </thead>
              <tbody>
                {soldes.content.map((row) => (
                  <tr key={row.id} className="border-b border-border/40">
                    <td className="px-3 py-2 font-mono text-xs">{formatFrDate(row.date)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-foreground">{row.memberId || "—"}</td>
                    <td className="px-3 py-2 text-xs text-foreground">{memberLabel(row).nom}</td>
                    <td className="px-3 py-2 font-mono text-xs text-right">{formatMoney(row.nombreParts, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {soldes && soldes.total > 0 && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              {soldes.total} ligne(s) · page {soldes.page + 1} / {Math.max(1, Math.ceil(soldes.total / 10))}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
              <button type="button" disabled={(page + 1) * 10 >= soldes.total} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
            </div>
          </div>
        )}
      </Card>
      {!isSuperAdmin && (
        <p className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-2">
          L'import Excel est réservé au super administrateur.
        </p>
      )}
      <Card className="p-5 space-y-4 max-w-xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Import Excel</p>
        <Field label="Fichier Excel">
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={!isSuperAdmin || saving}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setReport(null);
              setLocalError(null);
            }}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs"
          />
        </Field>
        <button type="button" disabled={!isSuperAdmin || saving || !file} onClick={() => void submit()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Upload size={13} />} Importer
        </button>
        {localError && <p className="text-xs text-red-600">{localError}</p>}
        {report && (
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-1 text-xs">
            <p className="font-medium text-foreground">Import terminé</p>
            <p className="text-muted-foreground">{report.depositsUpserted} solde(s) enregistré(s)</p>
            <p className="text-muted-foreground">{report.membersMatched} membre(s) existant(s)</p>
            <p className="text-muted-foreground">{report.membersCreated} membre(s) créé(s) (fiches à compléter)</p>
            {report.createdMatricules.length > 0 && (
              <p className="font-mono text-[10px] text-primary break-all">{report.createdMatricules.join(" · ")}</p>
            )}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={confirmClear}
        title="Supprimer tous les soldes"
        message="Supprimer tous les soldes de parts de tous les membres ? Cette action est irréversible."
        busy={saving}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}

export function PageValeursLiquidatives() {
  const { importValeursLiquidatives, createValeurLiquidative, deleteAllValeursLiquidatives, saving } = useMembership();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<{ upserted: number; skipped: number } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [data, setData] = useState<VlPage | null>(null);
  const [manual, setManual] = useState({ date: todayIso(), actifNet: "", nombreParts: "", valeur: "" });
  const [manualErrors, setManualErrors] = useState<Partial<Record<"date" | "valeur", string>>>({});
  const [manualOk, setManualOk] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    const query = new URLSearchParams({ page: String(page), size: "10" });
    if (filterDate) query.set("date", filterDate);
    api<VlPage>(`/api/admin/valeurs-liquidatives?${query}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setListError(err instanceof ApiError ? err.message : "Impossible de charger l'historique.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterDate, page, reloadKey]);

  const submitManual = async () => {
    const errors: Partial<Record<"date" | "valeur", string>> = {};
    if (!manual.date) errors.date = "Ce champ est obligatoire";
    const valeur = Number(String(manual.valeur).replace(/\s/g, "").replace(",", "."));
    if (!manual.valeur.trim()) errors.valeur = "Ce champ est obligatoire";
    else if (!Number.isFinite(valeur) || valeur <= 0) errors.valeur = "La valeur doit être supérieure à 0";
    setManualErrors(errors);
    setManualOk(null);
    if (Object.keys(errors).length) return;
    const actifNet = manual.actifNet.trim() ? Number(manual.actifNet.replace(/\s/g, "").replace(",", ".")) : null;
    const nombreParts = manual.nombreParts.trim() ? Number(manual.nombreParts.replace(/\s/g, "").replace(",", ".")) : null;
    const err = await createValeurLiquidative({
      date: manual.date,
      actifNet: actifNet != null && Number.isFinite(actifNet) ? actifNet : null,
      nombreParts: nombreParts != null && Number.isFinite(nombreParts) ? nombreParts : null,
      valeur,
    });
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setManualOk("Valeur liquidative enregistrée.");
    setManual((prev) => ({ ...prev, actifNet: "", nombreParts: "", valeur: "" }));
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const submitImport = async () => {
    if (!file) return;
    setLocalError(null);
    const result = await importValeursLiquidatives(file);
    if (result.error) {
      setReport(null);
      setLocalError(result.error);
      return;
    }
    setReport(result.report);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const clearAll = async () => {
    const result = await deleteAllValeursLiquidatives();
    setConfirmClear(false);
    if (result.error) {
      setLocalError(result.error);
      return;
    }
    setReport(null);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Admin"
        title="Valeur liquidative"
        subtitle="Une valeur par date (actif net, nombre de parts, VL). L’historique complet est conservé."
      />
      {data?.latest && (
        <Card className="p-5">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Dernière VL</p>
          <p className="font-display text-3xl font-bold text-foreground">{formatMoney(data.latest.valeur, 4)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(`${data.latest.date}T00:00:00`).toLocaleDateString("fr-FR")}
            {data.latest.actifNet != null ? ` · actif net ${formatMoney(data.latest.actifNet)} F` : ""}
            {data.latest.nombreParts != null ? ` · ${formatMoney(data.latest.nombreParts, 4)} parts` : ""}
          </p>
        </Card>
      )}
      <Card className="p-5 space-y-4 max-w-3xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nouvelle valeur</p>
        <div className="grid sm:grid-cols-4 gap-3">
          <Field label="Date" required error={manualErrors.date}>
            <input type="date" className={fieldInputClass(manualErrors.date)} value={manual.date} onChange={(e) => { setManual((p) => ({ ...p, date: e.target.value })); setManualErrors((p) => ({ ...p, date: undefined })); setManualOk(null); }} />
          </Field>
          <Field label="Actif net (F)">
            <input className={fieldClass} value={manual.actifNet} placeholder="optionnel" onChange={(e) => setManual((p) => ({ ...p, actifNet: e.target.value }))} />
          </Field>
          <Field label="Nombre de parts">
            <input className={fieldClass} value={manual.nombreParts} placeholder="optionnel" onChange={(e) => setManual((p) => ({ ...p, nombreParts: e.target.value }))} />
          </Field>
          <Field label="Valeur liquidative" required error={manualErrors.valeur}>
            <input className={fieldInputClass(manualErrors.valeur)} value={manual.valeur} placeholder="0" onChange={(e) => { setManual((p) => ({ ...p, valeur: e.target.value })); setManualErrors((p) => ({ ...p, valeur: undefined })); setManualOk(null); }} />
          </Field>
        </div>
        <button type="button" disabled={saving} onClick={() => void submitManual()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Plus size={13} />} Enregistrer
        </button>
        {manualOk && <p className="text-xs text-emerald-700">{manualOk}</p>}
        {localError && !file && <p className="text-xs text-red-600">{localError}</p>}
      </Card>
      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Field label="Date">
            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(0); }} className={`${fieldClass} max-w-[12rem]`} />
          </Field>
          {filterDate && (
            <button type="button" onClick={() => { setFilterDate(""); setPage(0); }} className="text-[11px] text-muted-foreground underline pb-2">Réinitialiser</button>
          )}
          {isSuperAdmin && (
            <button type="button" disabled={saving || !data?.total} onClick={() => setConfirmClear(true)} className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs border border-red-500/30 text-red-600 rounded disabled:opacity-40">
              <Trash2 size={13} /> Supprimer tout l'historique
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6"><Spinner className="h-4 w-4" /> Chargement…</div>
        ) : listError ? (
          <p className="text-xs text-red-600 py-4">{listError}</p>
        ) : !data?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucune valeur pour ces critères.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Date", "Actif net", "Nombre de parts", "Valeur liquidative"].map((h) => (
                    <th key={h} className={`px-3 py-2 font-mono text-[10px] text-muted-foreground uppercase ${h === "Date" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.content.map((row) => (
                  <tr key={row.id} className="border-b border-border/40">
                    <td className="px-3 py-2 font-mono text-xs">{new Date(`${row.date}T00:00:00`).toLocaleDateString("fr-FR")}</td>
                    <td className="px-3 py-2 font-mono text-xs text-right">{formatMoney(row.actifNet)} F</td>
                    <td className="px-3 py-2 font-mono text-xs text-right">{formatMoney(row.nombreParts, 4)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-right">{formatMoney(row.valeur, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">{data.total} valeur(s) · page {data.page + 1}</p>
            {data.total > data.size && (
              <div className="flex gap-2">
                <button type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
                <button type="button" disabled={(page + 1) * data.size >= data.total} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
              </div>
            )}
          </div>
        )}
      </Card>
      {!isSuperAdmin && (
        <p className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-2">
          L'import Excel est réservé au super administrateur.
        </p>
      )}
      <Card className="p-5 space-y-4 max-w-xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Import Excel</p>
        <Field label="Fichier Excel">
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={!isSuperAdmin || saving}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setReport(null);
              setLocalError(null);
            }}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs"
          />
        </Field>
        <button type="button" disabled={!isSuperAdmin || saving || !file} onClick={() => void submitImport()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Upload size={13} />} Importer
        </button>
        {localError && file && <p className="text-xs text-red-600">{localError}</p>}
        {report && (
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-1 text-xs">
            <p className="font-medium text-foreground">Import terminé</p>
            <p className="text-muted-foreground">{report.upserted} valeur(s) enregistrée(s)</p>
            <p className="text-muted-foreground">{report.skipped} ligne(s) ignorée(s)</p>
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={confirmClear}
        title="Supprimer l'historique"
        message="Supprimer toutes les valeurs liquidatives ? Cette action est irréversible."
        busy={saving}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}

export function PageEtatsParts() {
  const { importEtatsParts, createEtatPart, deleteAllEtatsParts, saving, members } = useMembership();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<{
    membersCreated: number;
    membersMatched: number;
    depositsUpserted: number;
    createdMatricules: string[];
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [manual, setManual] = useState({ memberId: "", date: todayIso(), nombreParts: "" });
  const [manualErrors, setManualErrors] = useState<Partial<Record<"memberId" | "date" | "nombreParts", string>>>({});
  const [manualOk, setManualOk] = useState<string | null>(null);
  const [rows, setRows] = useState<{
    content: {
      id: number;
      date: string;
      nombreParts: number;
      memberId: string;
      matricule: string;
      nom: string;
    }[];
    total: number;
    page: number;
    size: number;
  } | null>(null);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    const query = new URLSearchParams({ page: String(page), size: "10" });
    if (filterDate) query.set("date", filterDate);
    api<{
      content: {
        id: number;
        date: string;
        nombreParts: number;
        memberId: string;
        matricule: string;
        nom: string;
      }[];
      total: number;
      page: number;
      size: number;
    }>(`/api/admin/etats-parts?${query}`)
      .then((data) => {
        if (!cancelled) {
          setRows({
            content: (data.content ?? []).slice(0, 10),
            total: data.total,
            page: data.page,
            size: 10,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRows(null);
          setListError(err instanceof ApiError ? err.message : "Impossible de charger l'état des parts.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterDate, page, reloadKey]);

  const membersSorted = useMemo(
    () => [...members].sort((a, b) => (a.matricule || a.nom).localeCompare(b.matricule || b.nom, "fr")),
    [members],
  );

  const submitManual = async () => {
    const errors: Partial<Record<"memberId" | "date" | "nombreParts", string>> = {};
    if (!manual.memberId) errors.memberId = "Ce champ est obligatoire";
    if (!manual.date) errors.date = "Ce champ est obligatoire";
    const parts = Number(String(manual.nombreParts).replace(/\s/g, "").replace(",", "."));
    if (!manual.nombreParts.trim()) errors.nombreParts = "Ce champ est obligatoire";
    else if (!Number.isFinite(parts) || parts <= 0) errors.nombreParts = "Le nombre de parts doit être supérieur à 0";
    setManualErrors(errors);
    setManualOk(null);
    if (Object.keys(errors).length) return;
    const err = await createEtatPart({ memberId: manual.memberId, date: manual.date, nombreParts: parts });
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setManualOk("État des parts enregistré.");
    setManual((prev) => ({ ...prev, nombreParts: "" }));
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const submit = async () => {
    if (!file) return;
    setLocalError(null);
    const result = await importEtatsParts(file);
    if (result.error) {
      setReport(null);
      setLocalError(result.error);
      return;
    }
    setReport(result.report);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const clearAll = async () => {
    const result = await deleteAllEtatsParts();
    setConfirmClear(false);
    if (result.error) {
      setLocalError(result.error);
      return;
    }
    setReport(null);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Admin"
        title="État des parts"
        subtitle="Filtrez par date. 10 lignes par page. Chaque membre voit son historique dans son espace."
      />
      <Card className="p-5 space-y-4 max-w-3xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nouvel état</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Membre" required error={manualErrors.memberId}>
            <select className={fieldInputClass(manualErrors.memberId)} value={manual.memberId} onChange={(e) => { setManual((prev) => ({ ...prev, memberId: e.target.value })); setManualErrors((prev) => ({ ...prev, memberId: undefined })); setManualOk(null); }}>
              <option value="">Sélectionner un membre</option>
              {membersSorted.map((m) => (
                <option key={m.id} value={m.id}>{(m.matricule || "—") + " · " + m.nom}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" required error={manualErrors.date}>
            <input type="date" className={fieldInputClass(manualErrors.date)} value={manual.date} onChange={(e) => { setManual((prev) => ({ ...prev, date: e.target.value })); setManualErrors((prev) => ({ ...prev, date: undefined })); setManualOk(null); }} />
          </Field>
          <Field label="Nombre de parts" required error={manualErrors.nombreParts}>
            <input type="number" min={0} step="0.0001" className={fieldInputClass(manualErrors.nombreParts)} value={manual.nombreParts} placeholder="0" onChange={(e) => { setManual((prev) => ({ ...prev, nombreParts: e.target.value })); setManualErrors((prev) => ({ ...prev, nombreParts: undefined })); setManualOk(null); }} />
          </Field>
        </div>
        <button type="button" disabled={saving} onClick={() => void submitManual()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Plus size={13} />} Enregistrer
        </button>
        {manualOk && <p className="text-xs text-emerald-700">{manualOk}</p>}
        {localError && !file && <p className="text-xs text-red-600">{localError}</p>}
      </Card>
      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Field label="Date">
            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(0); }} className={`${fieldClass} max-w-[12rem]`} />
          </Field>
          {filterDate && (
            <button type="button" onClick={() => { setFilterDate(""); setPage(0); }} className="text-[11px] text-muted-foreground underline pb-2">Réinitialiser</button>
          )}
          {isSuperAdmin && (
            <button type="button" disabled={saving || !rows?.total} onClick={() => setConfirmClear(true)} className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs border border-red-500/30 text-red-600 rounded disabled:opacity-40">
              <Trash2 size={13} /> Supprimer tous les états
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6"><Spinner className="h-4 w-4" /> Chargement…</div>
        ) : listError ? (
          <p className="text-xs text-red-600 py-4">{listError}</p>
        ) : !rows?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucun état pour ces critères.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Date</th>
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">ID</th>
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Membre</th>
                  <th className="px-3 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Parts</th>
                </tr>
              </thead>
              <tbody>
                {rows.content.map((row) => (
                  <tr key={row.id} className="border-b border-border/40">
                    <td className="px-3 py-2 font-mono text-xs">{formatFrDate(row.date)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.memberId}</td>
                    <td className="px-3 py-2 text-xs">{row.nom}</td>
                    <td className="px-3 py-2 font-mono text-xs text-right">{formatMoney(row.nombreParts, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows && rows.total > 0 && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">{rows.total} ligne(s) · page {rows.page + 1}</p>
            {rows.total > rows.size && (
              <div className="flex gap-2">
                <button type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
                <button type="button" disabled={(page + 1) * rows.size >= rows.total} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
              </div>
            )}
          </div>
        )}
      </Card>
      {!isSuperAdmin && (
        <p className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-2">
          L'import Excel est réservé au super administrateur.
        </p>
      )}
      <Card className="p-5 space-y-4 max-w-xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Import Excel</p>
        <Field label="Fichier Excel">
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={!isSuperAdmin || saving}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setReport(null);
              setLocalError(null);
            }}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs"
          />
        </Field>
        <button type="button" disabled={!isSuperAdmin || saving || !file} onClick={() => void submit()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Upload size={13} />} Importer
        </button>
        {localError && <p className="text-xs text-red-600">{localError}</p>}
        {report && (
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-1 text-xs">
            <p className="font-medium text-foreground">Import terminé</p>
            <p className="text-muted-foreground">{report.depositsUpserted} état(s) enregistré(s)</p>
            <p className="text-muted-foreground">{report.membersMatched} membre(s) existant(s)</p>
            <p className="text-muted-foreground">{report.membersCreated} membre(s) créé(s) (fiches à compléter)</p>
            {report.createdMatricules.length > 0 && (
              <p className="font-mono text-[10px] text-primary break-all">{report.createdMatricules.join(" · ")}</p>
            )}
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={confirmClear}
        title="Supprimer tous les états"
        message="Supprimer tous les états des parts de tous les membres ? Cette action est irréversible."
        busy={saving}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}

export function PagePortefeuille() {
  const { importPortefeuille, createPortefeuilleLigne, deleteAllPortefeuille, saving } = useMembership();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<{ upserted: number; skipped: number } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [data, setData] = useState<{
    content: { id: number; symbole: string; titre: string; secteur: string | null }[];
    total: number;
    page: number;
    size: number;
  } | null>(null);
  const [manual, setManual] = useState({ symbole: "", titre: "", secteur: "" });
  const [manualErrors, setManualErrors] = useState<Partial<Record<"symbole" | "titre", string>>>({});
  const [manualOk, setManualOk] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    const query = new URLSearchParams({ page: String(page), size: "10" });
    if (q.trim()) query.set("q", q.trim());
    api<{
      content: { id: number; symbole: string; titre: string; secteur: string | null }[];
      total: number;
      page: number;
      size: number;
    }>(`/api/admin/portefeuille?${query}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setListError(err instanceof ApiError ? err.message : "Impossible de charger le portefeuille.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, page, reloadKey]);

  const submitManual = async () => {
    const errors: Partial<Record<"symbole" | "titre", string>> = {};
    if (!manual.symbole.trim()) errors.symbole = "Ce champ est obligatoire";
    if (!manual.titre.trim()) errors.titre = "Ce champ est obligatoire";
    setManualErrors(errors);
    setManualOk(null);
    if (Object.keys(errors).length) return;
    const err = await createPortefeuilleLigne({
      symbole: manual.symbole.trim(),
      titre: manual.titre.trim(),
      secteur: manual.secteur.trim() || undefined,
    });
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setManualOk("Ligne enregistrée.");
    setManual({ symbole: "", titre: "", secteur: "" });
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const submitImport = async () => {
    if (!file) return;
    setLocalError(null);
    const result = await importPortefeuille(file);
    if (result.error) {
      setReport(null);
      setLocalError(result.error);
      return;
    }
    setReport(result.report);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const clearAll = async () => {
    const result = await deleteAllPortefeuille();
    setConfirmClear(false);
    if (result.error) {
      setLocalError(result.error);
      return;
    }
    setReport(null);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Admin"
        title="Valeur du portefeuille"
        subtitle="Catalogue BRVM (symbole, titre, secteur). 10 lignes par page. Visible par tous les membres."
      />
      <Card className="p-5 space-y-4 max-w-3xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nouvelle ligne</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Symbole" required error={manualErrors.symbole}>
            <input className={fieldInputClass(manualErrors.symbole)} value={manual.symbole} placeholder="SNTS" onChange={(e) => { setManual((p) => ({ ...p, symbole: e.target.value })); setManualErrors((p) => ({ ...p, symbole: undefined })); setManualOk(null); }} />
          </Field>
          <Field label="Titre" required error={manualErrors.titre}>
            <input className={fieldInputClass(manualErrors.titre)} value={manual.titre} onChange={(e) => { setManual((p) => ({ ...p, titre: e.target.value })); setManualErrors((p) => ({ ...p, titre: undefined })); setManualOk(null); }} />
          </Field>
          <Field label="Secteur">
            <input className={fieldClass} value={manual.secteur} placeholder="optionnel" onChange={(e) => setManual((p) => ({ ...p, secteur: e.target.value }))} />
          </Field>
        </div>
        <button type="button" disabled={saving} onClick={() => void submitManual()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Plus size={13} />} Enregistrer
        </button>
        {manualOk && <p className="text-xs text-emerald-700">{manualOk}</p>}
        {localError && !file && <p className="text-xs text-red-600">{localError}</p>}
      </Card>
      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Field label="Recherche">
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Symbole, titre, secteur" className={`${fieldClass} max-w-[16rem]`} />
          </Field>
          {q && (
            <button type="button" onClick={() => { setQ(""); setPage(0); }} className="text-[11px] text-muted-foreground underline pb-2">Réinitialiser</button>
          )}
          {isSuperAdmin && (
            <button type="button" disabled={saving || !data?.total} onClick={() => setConfirmClear(true)} className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs border border-red-500/30 text-red-600 rounded disabled:opacity-40">
              <Trash2 size={13} /> Supprimer tout le portefeuille
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6"><Spinner className="h-4 w-4" /> Chargement…</div>
        ) : listError ? (
          <p className="text-xs text-red-600 py-4">{listError}</p>
        ) : !data?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucune ligne pour ces critères.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Symbole</th>
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Titre</th>
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase">Secteur</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((row) => (
                  <tr key={row.id} className="border-b border-border/40">
                    <td className="px-3 py-2 font-mono text-xs">{row.symbole}</td>
                    <td className="px-3 py-2 text-xs">{row.titre}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{row.secteur || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">{data.total} ligne(s) · page {data.page + 1}</p>
            {data.total > data.size && (
              <div className="flex gap-2">
                <button type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
                <button type="button" disabled={(page + 1) * data.size >= data.total} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
              </div>
            )}
          </div>
        )}
      </Card>
      {!isSuperAdmin && (
        <p className="text-xs text-amber-700 bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-2">
          L'import Excel est réservé au super administrateur.
        </p>
      )}
      <Card className="p-5 space-y-4 max-w-xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Import Excel</p>
        <Field label="Fichier Excel">
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={!isSuperAdmin || saving}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setReport(null);
              setLocalError(null);
            }}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs"
          />
        </Field>
        <button type="button" disabled={!isSuperAdmin || saving || !file} onClick={() => void submitImport()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Upload size={13} />} Importer
        </button>
        {localError && <p className="text-xs text-red-600">{localError}</p>}
        {report && (
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-1 text-xs">
            <p className="font-medium text-foreground">Import terminé</p>
            <p className="text-muted-foreground">{report.upserted} ligne(s) enregistrée(s)</p>
            <p className="text-muted-foreground">{report.skipped} ligne(s) ignorée(s)</p>
          </div>
        )}
      </Card>
      <ConfirmDialog
        open={confirmClear}
        title="Supprimer le portefeuille"
        message="Supprimer toutes les lignes du portefeuille ? Cette action est irréversible."
        busy={saving}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}

export function PageHistoriquePerformances() {
  return (
    <PageHistoriqueMembre
      title="Historique des performances"
      path="historiques-performances"
      valueLabel="Performance"
      formatValue={(n) => `${formatMoney(n, 4)} %`}
    />
  );
}

export function PageHistoriqueMontantsInvestis() {
  return (
    <PageHistoriqueMembre
      title="Historique des montants investis"
      path="historiques-montants-investis"
      valueLabel="Montant"
      formatValue={(n) => `${formatMoney(n)} F`}
    />
  );
}

export function PageHistoriqueCapitauxNets() {
  return (
    <PageHistoriqueMembre
      title="Historique des capitaux nets"
      path="historiques-capitaux-nets"
      valueLabel="Capital net"
      formatValue={(n) => `${formatMoney(n)} F`}
    />
  );
}

function PageHistoriqueMembre({
  title,
  path,
  valueLabel,
  formatValue,
}: {
  title: string;
  path: HistoriquePath;
  valueLabel: string;
  formatValue: (n: number) => string;
}) {
  const { importHistorique, createHistorique, deleteAllHistoriques, saving, members } = useMembership();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<{
    membersCreated: number;
    membersMatched: number;
    depositsUpserted: number;
    createdMatricules: string[];
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [manual, setManual] = useState({ memberId: "", date: todayIso(), valeur: "" });
  const [manualErrors, setManualErrors] = useState<Partial<Record<"memberId" | "date" | "valeur", string>>>({});
  const [manualOk, setManualOk] = useState<string | null>(null);
  const [rows, setRows] = useState<{
    content: { id: number; date: string; valeur: number; memberId: string; matricule: string; nom: string }[];
    total: number;
    page: number;
    size: number;
  } | null>(null);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    const query = new URLSearchParams({ page: String(page), size: "10" });
    if (filterDate) query.set("date", filterDate);
    api<{
      content: { id: number; date: string; valeur: number; memberId: string; matricule: string; nom: string }[];
      total: number;
      page: number;
      size: number;
    }>(`/api/admin/${path}?${query}`)
      .then((data) => {
        if (!cancelled) {
          setRows({
            content: (data.content ?? []).slice(0, 10),
            total: data.total,
            page: data.page,
            size: 10,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRows(null);
          setListError(err instanceof ApiError ? err.message : "Impossible de charger l'historique.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, filterDate, page, reloadKey]);

  const membersSorted = useMemo(
    () => [...members].sort((a, b) => (a.matricule || a.nom).localeCompare(b.matricule || b.nom, "fr")),
    [members],
  );

  const submitManual = async () => {
    const errors: Partial<Record<"memberId" | "date" | "valeur", string>> = {};
    if (!manual.memberId) errors.memberId = "Ce champ est obligatoire";
    if (!manual.date) errors.date = "Ce champ est obligatoire";
    const valeur = Number(String(manual.valeur).replace(/\s/g, "").replace(",", ".").replace("%", ""));
    if (!manual.valeur.trim()) errors.valeur = "Ce champ est obligatoire";
    else if (!Number.isFinite(valeur)) errors.valeur = "Valeur invalide";
    setManualErrors(errors);
    setManualOk(null);
    if (Object.keys(errors).length) return;
    const err = await createHistorique(path, { memberId: manual.memberId, date: manual.date, valeur });
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setManualOk("Ligne enregistrée.");
    setManual((prev) => ({ ...prev, valeur: "" }));
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const submit = async () => {
    if (!file) return;
    setLocalError(null);
    const result = await importHistorique(path, file);
    if (result.error) {
      setReport(null);
      setLocalError(result.error);
      return;
    }
    setReport(result.report);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  const clearAll = async () => {
    const result = await deleteAllHistoriques(path);
    setConfirmClear(false);
    if (result.error) {
      setLocalError(result.error);
      return;
    }
    setReport(null);
    setPage(0);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Admin"
        title={title}
        subtitle="Filtrez par date. 10 lignes par page. Chaque membre voit son historique dans son espace."
      />
      <WorkTabs
        initial="list"
        items={[
          {
            id: "create",
            label: "Saisie",
            content: (
              <div className="space-y-4 max-w-3xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nouvelle ligne</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Membre" required error={manualErrors.memberId}>
            <select className={fieldInputClass(manualErrors.memberId)} value={manual.memberId} onChange={(e) => { setManual((prev) => ({ ...prev, memberId: e.target.value })); setManualErrors((prev) => ({ ...prev, memberId: undefined })); setManualOk(null); }}>
              <option value="">Sélectionner un membre</option>
              {membersSorted.map((m) => (
                <option key={m.id} value={m.id}>{(m.matricule || "—") + " · " + m.nom}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" required error={manualErrors.date}>
            <input type="date" className={fieldInputClass(manualErrors.date)} value={manual.date} onChange={(e) => { setManual((prev) => ({ ...prev, date: e.target.value })); setManualErrors((prev) => ({ ...prev, date: undefined })); setManualOk(null); }} />
          </Field>
          <Field label={valueLabel} required error={manualErrors.valeur}>
            <input className={fieldInputClass(manualErrors.valeur)} value={manual.valeur} placeholder="0" onChange={(e) => { setManual((prev) => ({ ...prev, valeur: e.target.value })); setManualErrors((prev) => ({ ...prev, valeur: undefined })); setManualOk(null); }} />
          </Field>
        </div>
        <button type="button" disabled={saving} onClick={() => void submitManual()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Plus size={13} />} Enregistrer
        </button>
        {manualOk && <p className="text-xs text-emerald-700">{manualOk}</p>}
        {localError && !file && <p className="text-xs text-red-600">{localError}</p>}
              </div>
            ),
          },
          {
            id: "list",
            label: "Historique",
            content: (
              <>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Field label="Date">
            <input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(0); }} className={`${fieldClass} max-w-[12rem]`} />
          </Field>
          {filterDate && (
            <button type="button" onClick={() => { setFilterDate(""); setPage(0); }} className="text-[11px] text-muted-foreground underline pb-2">Réinitialiser</button>
          )}
          {isSuperAdmin && (
            <button type="button" disabled={saving || !rows?.total} onClick={() => setConfirmClear(true)} className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs border border-red-500/30 text-red-600 rounded disabled:opacity-40">
              <Trash2 size={13} /> Supprimer tout l'historique
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-6"><Spinner className="h-4 w-4" /> Chargement…</div>
        ) : listError ? (
          <p className="text-xs text-red-600 py-4">{listError}</p>
        ) : !rows?.content.length ? (
          <p className="text-xs text-muted-foreground py-4">Aucune ligne pour ces critères.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Date</th>
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">ID</th>
                  <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Membre</th>
                  <th className="px-3 py-2 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{valueLabel}</th>
                </tr>
              </thead>
              <tbody>
                {rows.content.map((row) => (
                  <tr key={row.id} className="border-b border-border/40">
                    <td className="px-3 py-2 font-mono text-xs">{formatFrDate(row.date)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.memberId}</td>
                    <td className="px-3 py-2 text-xs">{row.nom}</td>
                    <td className="px-3 py-2 font-mono text-xs text-right">{formatValue(row.valeur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows && rows.total > 0 && (
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-muted-foreground">{rows.total} ligne(s) · page {rows.page + 1}</p>
            {rows.total > rows.size && (
              <div className="flex gap-2">
                <button type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Précédent</button>
                <button type="button" disabled={(page + 1) * rows.size >= rows.total} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-[11px] border border-border rounded disabled:opacity-40">Suivant</button>
              </div>
            )}
          </div>
        )}
              </>
            ),
          },
          {
            id: "import",
            label: "Import",
            hidden: !isSuperAdmin,
            content: (
              <div className="space-y-4 max-w-xl">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Import Excel</p>
        <Field label="Fichier Excel">
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={!isSuperAdmin || saving}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setReport(null);
              setLocalError(null);
            }}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs"
          />
        </Field>
        <button type="button" disabled={!isSuperAdmin || saving || !file} onClick={() => void submit()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-medium disabled:opacity-60">
          {saving ? <Spinner className="h-3 w-3" /> : <Upload size={13} />} Importer
        </button>
        {localError && <p className="text-xs text-red-600">{localError}</p>}
        {report && (
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-1 text-xs">
            <p className="font-medium text-foreground">Import terminé</p>
            <p className="text-muted-foreground">{report.depositsUpserted} ligne(s) enregistrée(s)</p>
            <p className="text-muted-foreground">{report.membersMatched} membre(s) existant(s)</p>
            <p className="text-muted-foreground">{report.membersCreated} membre(s) créé(s) (fiches à compléter)</p>
          </div>
        )}
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Supprimer l'historique"
        message={`Supprimer tout l'historique « ${title} » ? Cette action est irréversible.`}
        busy={saving}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}

export const NAV_ICONS = {
  accueil: Activity,
  membres: Users,
  inscription: ClipboardList,
  roles: KeyRound,
  gouvernance: Award,
  participations: TrendingUp,
  sessions: Calendar,
  "mon-espace": UserCheck,
  parametres: Settings,
  depots: Wallet,
  retraits: ArrowDownToLine,
  "solde-parts": PieChart,
  "etat-parts": Layers,
  "valeur-portefeuille": Briefcase,
  "historique-performances": Percent,
  "historique-montants-investis": Banknote,
  "historique-capitaux-nets": Landmark,
  "valeur-liquidative": LineChart,
} as const;
