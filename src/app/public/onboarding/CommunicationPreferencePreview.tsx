import { Loader2 } from "lucide-react";
import type { CommunicationPreference, Questionnaire } from "./types";

type Props = {
  data: Questionnaire;
  preference: CommunicationPreference;
  saving: boolean;
  error: string | null;
  onEdit: () => void;
  onConfirm: () => Promise<void>;
};

export function CommunicationPreferencePreview({
  data,
  preference,
  saving,
  error,
  onEdit,
  onConfirm,
}: Props) {
  const modes = preference.modes
    .map((m) => (m === "COURRIER" ? "Courrier" : m === "EMAIL" ? "Email" : m))
    .join(" · ");

  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <div className="rounded-xl bg-[#0B1B59]/5 border border-[#0B1B59]/10 px-4 py-3 text-[13px]">
        Vérifiez la préférence de communication. Après validation, le PDF 006 est enregistré et le dossier est
        terminé.
      </div>

      <article className="rounded-2xl bg-white border border-[#0B1B59]/10 px-5 py-6 space-y-3">
        <h3 className="font-display text-lg font-bold uppercase text-center">Préférence de communication</h3>
        <p className="text-[13px]">
          Client : <strong>{`${data.prenoms || ""} ${data.nom || ""}`.trim() || "—"}</strong>
        </p>
        <p className="text-[13px]">
          Modes : <strong>{modes || "—"}</strong>
        </p>
        <p className="text-[13px]">
          Fait à <strong>{preference.faitA || "Dakar"}</strong>, le{" "}
          <strong>{preference.faitLe ? preference.faitLe.split("-").reverse().join("/") : "—"}</strong>
        </p>
      </article>

      {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="h-11 px-5 rounded-full border border-[#0B1B59]/15 text-sm font-semibold text-[#0B1B59]"
        >
          Modifier
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void onConfirm()}
          className="h-11 px-6 rounded-full bg-[#F5D251] text-[#0B1B59] text-sm font-bold inline-flex items-center gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : null}
          Valider et terminer le dossier
        </button>
      </div>
    </div>
  );
}
