import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check, ClipboardList, Download, Eye, FileText, Loader2, Search, X,
} from "lucide-react";
import { api, ApiError } from "../api";
import { useMembership } from "./MembershipContext";
import { Badge, Card, ConfirmDialog, EmptyState, SectionTitle } from "./ui";
import type {
  AccountConvention,
  AccountOpening,
  CommunicationPreference,
  DocumentKind,
  InvestorApplication,
  MandateAgreement,
  Questionnaire,
} from "../public/onboarding/types";

type FilterMode = "pending" | "in_progress" | "rejected" | "all";

type ApplicationSummary = {
  id: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  civilite: string | null;
  nom: string | null;
  prenoms: string | null;
  email: string | null;
  telephone: string | null;
  memberId: string | null;
  pendingValidation: boolean;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  questionnaireCompletedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
};

type AdminApplication = InvestorApplication & {
  civilite?: string | null;
  nom?: string | null;
  prenoms?: string | null;
  email?: string | null;
  telephone?: string | null;
  memberId?: string | null;
  pendingValidation?: boolean;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
};

const DOC_LABELS: Record<DocumentKind, string> = {
  PIECE_IDENTITE: "Pièce d’identité",
  PREUVE_ADRESSE: "Preuve d’adresse",
  PHOTO_IDENTITE: "Photo d’identité",
  SIGNATURE_SPECIMEN: "Spécimen de signature",
  QUESTIONNAIRE_EXPORTE: "001 — Questionnaire (PDF)",
  CARTON_SIGNATURE_EXPORTE: "002 — Carton signature (PDF)",
  DEMANDE_OUVERTURE_EXPORTE: "003 — Demande d’ouverture (PDF)",
  CONVENTION_OUVERTURE_EXPORTE: "004 — Convention d’ouverture (PDF)",
  GESTION_MANDAT_EXPORTE: "005 — Gestion sous mandat (PDF)",
  PREFERENCE_COMM_EXPORTE: "006 — Préférence communication (PDF)",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  QUESTIONNAIRE_DONE: "Étape 1 OK",
  SIGNATURE_DONE: "Étape 2 OK",
  OUVERTURE_DONE: "Étape 3 OK",
  CONVENTION_DONE: "Étape 4 OK",
  MANDAT_DONE: "Étape 5 OK",
  COMPLETED: "Dossier complet",
  REJECTED: "Refusé",
};

function displayName(s: { civilite?: string | null; prenoms?: string | null; nom?: string | null }) {
  return [s.civilite, s.prenoms, s.nom].filter(Boolean).join(" ") || "Sans nom";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("fr-FR");
  } catch {
    return value;
  }
}

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const text =
    value === null || value === undefined || value === ""
      ? "—"
      : typeof value === "boolean"
        ? value
          ? "Oui"
          : "Non"
        : String(value);
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5 border-b border-border/40 text-xs">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-foreground break-words">{text}</span>
    </div>
  );
}

async function openProtectedFile(path: string) {
  const token = localStorage.getItem("finx-token");
  const response = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError((body?.message as string) || "Téléchargement impossible.", response.status);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function PageInscription() {
  const { reload } = useMembership();
  const [filter, setFilter] = useState<FilterMode>("pending");
  const [search, setSearch] = useState("");
  const [list, setList] = useState<ApplicationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingValidate, setPendingValidate] = useState(false);
  const [pendingReject, setPendingReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [tab, setTab] = useState<"identite" | "formulaires" | "documents">("identite");

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api<ApplicationSummary[]>(
        `/api/admin/investor-applications?filter=${encodeURIComponent(filter)}`,
      );
      setList(rows);
      if (selectedId && !rows.some((r) => r.id === selectedId)) {
        setSelectedId(rows[0]?.id ?? null);
      } else if (!selectedId && rows[0]) {
        setSelectedId(rows[0].id);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les candidatures.");
    } finally {
      setLoading(false);
    }
  }, [filter, selectedId]);

  useEffect(() => {
    void loadList();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      setError(null);
      try {
        const data = await api<AdminApplication>(`/api/admin/investor-applications/${encodeURIComponent(selectedId)}`);
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Dossier introuvable.");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) =>
      [row.nom, row.prenoms, row.email, row.telephone, row.id]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [list, search]);

  const q: Questionnaire | undefined = detail?.questionnaire;
  const opening: AccountOpening | undefined = detail?.accountOpening;
  const convention: AccountConvention | undefined = detail?.accountConvention;
  const mandate: MandateAgreement | undefined = detail?.mandateAgreement;
  const preference: CommunicationPreference | undefined = detail?.communicationPreference;

  const onValidate = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      await api(`/api/admin/investor-applications/${encodeURIComponent(selectedId)}/validate`, { method: "POST" });
      setMessage("Dossier validé : le candidat est devenu membre. Identifiants envoyés (ou journalisés).");
      setPendingValidate(false);
      await reload();
      await loadList();
      const data = await api<AdminApplication>(`/api/admin/investor-applications/${encodeURIComponent(selectedId)}`);
      setDetail(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Validation impossible.");
    } finally {
      setSaving(false);
    }
  };

  const onReject = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      const data = await api<AdminApplication>(
        `/api/admin/investor-applications/${encodeURIComponent(selectedId)}/reject`,
        {
          method: "POST",
          body: JSON.stringify({ reason: rejectReason }),
        },
      );
      setDetail(data);
      setMessage("Dossier refusé.");
      setPendingReject(false);
      setRejectReason("");
      await reload();
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Refus impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        label="Gestion"
        title="Inscriptions"
        subtitle="Candidatures investisseurs : consulter les formulaires et pièces, puis valider ou refuser."
      />

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-secondary border border-border rounded px-3 py-2 flex-1 max-w-xs">
          <Search size={13} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="bg-transparent text-xs w-full focus:outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterMode)}
          className="finx-select h-9 px-3 rounded border border-border bg-card text-xs"
        >
          <option value="pending">À valider</option>
          <option value="in_progress">En cours</option>
          <option value="rejected">Refusés</option>
          <option value="all">Tous</option>
        </select>
      </div>

      {message && (
        <p className="text-xs text-emerald-700 bg-emerald-500/10 border border-emerald-500/25 rounded-md px-3 py-2">
          {message}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 bg-red-500/10 border border-red-500/25 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <ClipboardList size={14} className="text-primary" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {filtered.length} candidature(s)
            </p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="py-10 flex justify-center text-muted-foreground">
                <Loader2 className="animate-spin" size={18} />
              </div>
            ) : !filtered.length ? (
              <EmptyState text="Aucune candidature pour ce filtre." />
            ) : (
              filtered.map((row) => {
                const active = row.id === selectedId;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      setMessage(null);
                      setSelectedId(row.id);
                      setTab("identite");
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-secondary/50 ${
                      active ? "bg-secondary/70" : ""
                    }`}
                  >
                    <p className="text-xs font-medium text-foreground">{displayName(row)}</p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{row.email || "—"}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Badge variant={row.pendingValidation ? "warning" : row.status === "REJECTED" ? "danger" : "neutral"}>
                        {row.pendingValidation ? "À valider" : STATUS_LABEL[row.status] ?? row.status}
                      </Badge>
                      <Badge variant="neutral">{row.documentCount} doc(s)</Badge>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          {!selectedId ? (
            <EmptyState text="Sélectionnez une candidature." />
          ) : detailLoading || !detail ? (
            <div className="py-16 flex justify-center text-muted-foreground">
              <Loader2 className="animate-spin" size={20} />
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-wide">
                    {displayName(detail)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {detail.email || "—"} · {detail.telephone || "—"}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    {STATUS_LABEL[detail.status] ?? detail.status} · étape {detail.currentStep}/{detail.totalSteps} ·
                    mis à jour {formatDate(detail.updatedAt)}
                  </p>
                  {detail.rejectionReason && (
                    <p className="mt-2 text-xs text-red-600">Motif de refus : {detail.rejectionReason}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {detail.pendingValidation && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPendingValidate(true)}
                        className="h-9 px-3 rounded text-xs font-medium bg-primary text-primary-foreground inline-flex items-center gap-1.5"
                      >
                        <Check size={13} /> Valider → membre
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingReject(true)}
                        className="h-9 px-3 rounded text-xs font-medium border border-red-500/30 text-red-600 inline-flex items-center gap-1.5"
                      >
                        <X size={13} /> Refuser
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2 border-b border-border">
                {(
                  [
                    ["identite", "Identité"],
                    ["formulaires", "Formulaires"],
                    ["documents", "Documents"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px ${
                      tab === key
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "identite" && q && (
                <div className="space-y-1">
                  <Row label="Civilité" value={q.civilite} />
                  <Row label="Nom" value={q.nom} />
                  <Row label="Prénoms" value={q.prenoms} />
                  <Row label="Naissance" value={[q.dateNaissance, q.lieuNaissance].filter(Boolean).join(" · ")} />
                  <Row label="Adresse" value={q.adresse} />
                  <Row label="Nationalité(s)" value={q.nationalites} />
                  <Row label="E-mail" value={q.email} />
                  <Row label="Téléphone" value={q.telephone} />
                  <Row label="Pièce" value={[q.pieceIdentiteType, q.pieceIdentiteNumero].filter(Boolean).join(" · ")} />
                  <Row label="Délivrance" value={q.pieceIdentiteDelivrance} />
                  <Row label="Expiration" value={q.pieceIdentiteExpiration} />
                  <Row label="Profession" value={q.profession} />
                  <Row label="Employeur" value={q.employeur} />
                  <Row label="Classification" value={q.classification} />
                  <Row label="Statut matrimonial" value={q.statutMatrimonial} />
                </div>
              )}

              {tab === "formulaires" && (
                <div className="space-y-5">
                  <section>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      003 — Demande d’ouverture
                    </p>
                    <Row label="Type compte" value={opening?.compteType} />
                    <Row label="Attestation" value={opening?.attestationExactitude} />
                    <Row label="Fait à / le" value={[opening?.faitA, opening?.faitLe].filter(Boolean).join(" · ")} />
                    <Row
                      label="Mandataire"
                      value={
                        opening?.mandataire
                          ? [opening.mandataire.prenoms, opening.mandataire.nom, opening.mandataire.telephone]
                              .filter(Boolean)
                              .join(" · ")
                          : "—"
                      }
                    />
                  </section>
                  <section>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      004 — Convention d’ouverture
                    </p>
                    <Row label="N° compte" value={convention?.numeroCompte} />
                    <Row label="Accepte convention" value={convention?.accepteConvention} />
                    <Row label="Accepte tarifs" value={convention?.accepteTarifs} />
                    <Row label="Fait à / le" value={[convention?.faitA, convention?.faitLe].filter(Boolean).join(" · ")} />
                  </section>
                  <section>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      005 — Gestion sous mandat
                    </p>
                    <Row label="Horizon" value={mandate?.horizonPlacement} />
                    <Row label="Profil" value={mandate?.profilInvestisseur} />
                    <Row label="Accepte mandat" value={mandate?.accepteMandat} />
                    <Row label="Accepte tarifs" value={mandate?.accepteTarifs} />
                    <Row label="Fait à / le" value={[mandate?.faitA, mandate?.faitLe].filter(Boolean).join(" · ")} />
                  </section>
                  <section>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      006 — Préférence de communication
                    </p>
                    <Row label="Modes" value={preference?.modes?.join(", ")} />
                    <Row label="Fait à / le" value={[preference?.faitA, preference?.faitLe].filter(Boolean).join(" · ")} />
                  </section>
                  <section>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Questionnaire — contacts d’urgence
                    </p>
                    {(q?.contactsUrgence ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">Aucun contact.</p>
                    ) : (
                      q!.contactsUrgence.map((c, i) => (
                        <Row
                          key={i}
                          label={`Contact ${i + 1}`}
                          value={[c.prenoms, c.nom, c.telephone].filter(Boolean).join(" · ")}
                        />
                      ))
                    )}
                  </section>
                </div>
              )}

              {tab === "documents" && (
                <div className="space-y-2">
                  {(detail.documents ?? []).length === 0 ? (
                    <EmptyState text="Aucun document pour ce dossier." />
                  ) : (
                    detail.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                      >
                        <div className="min-w-0 flex items-start gap-2">
                          <FileText size={14} className="text-primary mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {DOC_LABELS[doc.kind as DocumentKind] ?? doc.kind}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground truncate">
                              {doc.originalFilename} · {Math.round(doc.sizeBytes / 1024)} Ko ·{" "}
                              {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 h-8 px-2.5 rounded border border-border text-[11px] inline-flex items-center gap-1.5 hover:bg-secondary"
                          onClick={() =>
                            void openProtectedFile(
                              `/api/admin/investor-applications/${encodeURIComponent(detail.id)}/documents/${doc.id}/content`,
                            ).catch((err) =>
                              setError(err instanceof ApiError ? err.message : "Ouverture impossible."),
                            )
                          }
                        >
                          {String(doc.contentType || "").startsWith("image/") ? <Eye size={12} /> : <Download size={12} />}
                          Ouvrir
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={pendingValidate}
        title="Valider l’investisseur"
        message={
          detail
            ? `Activer ${displayName(detail)} (${detail.email}) comme membre ? Un e-mail avec les identifiants sera envoyé.`
            : ""
        }
        confirmLabel="Valider"
        danger={false}
        busy={saving}
        error={error}
        onCancel={() => setPendingValidate(false)}
        onConfirm={() => void onValidate()}
      />

      {pendingReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-xl w-full max-w-md p-5 space-y-3">
            <h3 className="font-display text-lg font-bold uppercase">Refuser le dossier</h3>
            <p className="text-xs text-muted-foreground">
              Le candidat INVITE sera retiré. Indiquez le motif (visible côté admin).
            </p>
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
                  setPendingReject(false);
                  setRejectReason("");
                }}
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="button"
                className="h-9 px-3 rounded text-xs bg-red-600 text-white disabled:opacity-50"
                disabled={saving || !rejectReason.trim()}
                onClick={() => void onReject()}
              >
                {saving ? "…" : "Confirmer le refus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
