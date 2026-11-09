import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { api, ApiError } from "../api";
import { useMembership } from "./MembershipContext";
import { Badge, Card, ConfirmDialog, EmptyState, SectionTitle } from "./ui";

type FilterMode = "pending" | "approved" | "rejected" | "all";

type VisitorSummary = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string | null;
};

type VisitorDetail = VisitorSummary & {
  adresse: string;
  rejectionReason?: string | null;
  memberId?: string | null;
  userId?: number | null;
};

const STATUS_LABEL: Record<VisitorSummary["statut"], string> = {
  PENDING: "À valider",
  APPROVED: "Validé",
  REJECTED: "Refusé",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("fr-FR");
  } catch {
    return value;
  }
}

export function PageVisiteurs() {
  const { reload } = useMembership();
  const [filter, setFilter] = useState<FilterMode>("pending");
  const [items, setItems] = useState<VisitorSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<VisitorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [confirmValidate, setConfirmValidate] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<VisitorSummary[]>(`/api/admin/visiteurs?filter=${filter}`);
      setItems(data);
      if (selectedId && !data.some((item) => item.id === selectedId)) {
        setSelectedId(null);
        setDetail(null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les visiteurs.");
    } finally {
      setLoading(false);
    }
  }, [filter, selectedId]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      try {
        const data = await api<VisitorDetail>(`/api/admin/visiteurs/${selectedId}`);
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Impossible de charger le détail.");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.nom, item.prenom, item.email, item.telephone].join(" ").toLowerCase().includes(q),
    );
  }, [items, query]);

  const validate = async () => {
    if (!selectedId) return;
    setActing(true);
    setError(null);
    try {
      await api(`/api/admin/visiteurs/${selectedId}/validate`, { method: "POST" });
      setConfirmValidate(false);
      await reload();
      await loadList();
      const data = await api<VisitorDetail>(`/api/admin/visiteurs/${selectedId}`);
      setDetail(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Validation impossible.");
    } finally {
      setActing(false);
    }
  };

  const reject = async () => {
    if (!selectedId || !rejectReason.trim()) return;
    setActing(true);
    setError(null);
    try {
      await api(`/api/admin/visiteurs/${selectedId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      setRejectOpen(false);
      setRejectReason("");
      await loadList();
      const data = await api<VisitorDetail>(`/api/admin/visiteurs/${selectedId}`);
      setDetail(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Refus impossible.");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Gestion"
        title="Visiteurs"
        subtitle="Demandes d’accès simples à valider avant création du compte visiteur."
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", "À valider"],
            ["approved", "Validés"],
            ["rejected", "Refusés"],
            ["all", "Tous"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`h-9 px-3 rounded-full text-xs font-semibold border ${
              filter === key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background text-sm"
          placeholder="Rechercher nom, e-mail, téléphone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid lg:grid-cols-[1.1fr_1.2fr] gap-4">
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center text-muted-foreground">
              <Loader2 className="animate-spin" />
            </div>
          ) : !filtered.length ? (
            <EmptyState text="Aucun visiteur pour ce filtre." />
          ) : (
            <div className="divide-y divide-border/60 max-h-[70vh] overflow-y-auto">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-secondary/40 ${
                    selectedId === item.id ? "bg-secondary/60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {item.prenom} {item.nom}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.email}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{item.telephone}</p>
                    </div>
                    <Badge variant={item.statut === "PENDING" ? "warning" : item.statut === "APPROVED" ? "success" : "danger"}>
                      {STATUS_LABEL[item.statut]}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">{formatDate(item.createdAt)}</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          {!selectedId ? (
            <EmptyState text="Sélectionnez une demande pour consulter le détail." />
          ) : detailLoading || !detail ? (
            <div className="py-16 flex justify-center text-muted-foreground">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {detail.prenom} {detail.nom}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{STATUS_LABEL[detail.statut]}</p>
                </div>
                {detail.statut === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmValidate(true)}
                      className="h-9 px-3 rounded-full bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Check size={14} /> Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectOpen(true)}
                      className="h-9 px-3 rounded-full border border-border text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <X size={14} /> Refuser
                    </button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Info label="E-mail" value={detail.email} />
                <Info label="Téléphone" value={detail.telephone} />
                <Info label="Adresse" value={detail.adresse} />
                <Info label="Créé le" value={formatDate(detail.createdAt)} />
                <Info label="Traité le" value={formatDate(detail.reviewedAt)} />
                <Info label="Membre lié" value={detail.memberId || "—"} />
              </div>

              {detail.rejectionReason && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  Motif de refus : {detail.rejectionReason}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmValidate}
        title="Valider ce visiteur ?"
        message="Un compte d’accès basique sera créé et les identifiants seront envoyés par e-mail (ou loggés si SMTP absent)."
        confirmLabel="Valider"
        danger={false}
        busy={acting}
        error={error}
        onCancel={() => setConfirmValidate(false)}
        onConfirm={() => void validate()}
      />

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-5 space-y-3">
            <h3 className="font-display text-lg font-bold uppercase">Refuser la demande</h3>
            <p className="text-xs text-muted-foreground">Indiquez le motif (visible côté admin).</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              placeholder="Motif du refus…"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="h-9 px-3 rounded text-xs border border-border"
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason("");
                }}
                disabled={acting}
              >
                Annuler
              </button>
              <button
                type="button"
                className="h-9 px-3 rounded text-xs bg-red-600 text-white disabled:opacity-50"
                disabled={acting || !rejectReason.trim()}
                onClick={() => void reject()}
              >
                {acting ? "…" : "Confirmer le refus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/20 px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
