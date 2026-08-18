import type { ReactNode } from "react";
import type { MemberStatus } from "./types";
import { STATUS_LABELS } from "./types";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-card border border-border rounded-lg ${className}`}>{children}</div>;
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

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
      {children}
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
