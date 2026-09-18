import type { ReactNode } from "react";
import type { MemberStatus } from "./types";
import { STATUS_LABELS } from "./types";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`finx-card bg-card border border-border rounded-lg ${className}`}>{children}</div>;
}

export function SectionTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-primary tracking-[0.2em] uppercase mb-2">{label}</p>
      <h2 className="font-display text-3xl font-bold text-foreground uppercase tracking-wide">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" | "premium";
}) {
  const styles: Record<string, string> = {
    default: "bg-primary/10 text-primary border border-primary/25",
    success: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-700 border border-amber-500/30",
    danger: "bg-red-500/15 text-red-600 border border-red-500/30",
    info: "bg-primary/10 text-primary border border-primary/20",
    neutral: "bg-secondary text-muted-foreground border border-border",
    premium: "badge-premium bg-[#F5D251]/30 text-[#0B1B59] border border-[#0B1B59]/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function statusVariant(statut: MemberStatus): "success" | "warning" | "danger" | "neutral" | "info" {
  if (statut === "confirme" || statut === "actif") return "success";
  if (statut === "simple") return "info";
  if (statut === "suspendu") return "danger";
  return "neutral";
}

export function StatusBadge({ statut }: { statut: MemberStatus }) {
  return <Badge variant={statusVariant(statut)}>{STATUS_LABELS[statut]}</Badge>;
}

export function Field({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
      {error && <span className="block text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

export function roleTone(tone: string) {
  const map: Record<string, string> = {
    cyan: "bg-primary/10 text-primary border-primary/25",
    navy: "bg-[#0B1B59]/10 text-[#0B1B59] border-[#0B1B59]/25",
    premium: "role-tone-premium bg-[#F5D251]/30 text-[#0B1B59] border-[#0B1B59]/20",
    muted: "bg-secondary text-muted-foreground border-border",
    danger: "bg-red-500/10 text-red-600 border-red-500/25",
  };
  return map[tone] ?? map.muted;
}

export const fieldClass =
  "finx-select w-full bg-white border border-border rounded px-3 py-2 text-xs text-[#0B1B59] focus:outline-none focus:border-primary/50";

export function fieldInputClass(error?: string) {
  return `${fieldClass} ${error ? "border-red-500/70 focus:border-red-500" : ""}`;
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-primary/25 border-t-primary ${className}`}
      aria-hidden
    />
  );
}

export function PageLoader({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Spinner className="h-9 w-9 border-[3px]" />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm text-muted-foreground py-10 text-center px-4">{text}</p>
  );
}

export function SavingOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card finx-card px-4 py-3 shadow-sm">
        <Spinner />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Enregistrement…</span>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card finx-card border border-border rounded-xl w-full max-w-sm p-5 space-y-4">
        <h3 className="font-display text-lg font-bold uppercase text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="px-3 py-2 text-xs border border-border rounded text-muted-foreground disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="px-4 py-2 text-xs bg-red-600 text-white rounded font-medium disabled:opacity-60 flex items-center gap-2"
          >
            {busy && <Spinner className="h-3 w-3 border-white/40 border-t-white" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
