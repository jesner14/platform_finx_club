import { Loader2 } from "lucide-react";
import { QuestionnaireSummary } from "./QuestionnaireSummary";
import type { AccountOpening, Questionnaire } from "./types";

type Props = {
  data: Questionnaire;
  opening: AccountOpening;
  saving: boolean;
  error: string | null;
  onEdit: () => void;
  onConfirm: () => Promise<void>;
};

export function AccountOpeningPreview({ data, opening, saving, error, onEdit, onConfirm }: Props) {
  const m = opening.mandataire;
  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <div className="rounded-xl bg-[#0B1B59]/5 border border-[#0B1B59]/10 px-4 py-3 text-[13px]">
        Vérifiez la demande d’ouverture. Après validation, le PDF 003 est enregistré et l’étape 004 s’ouvre.
      </div>

      <article className="rounded-2xl bg-white border border-[#0B1B59]/10 px-5 py-6 max-h-[70vh] overflow-y-auto space-y-4">
        <h3 className="font-display text-lg font-bold uppercase text-center">Demande d’ouverture de compte</h3>
        <p className="text-[13px]">
          Type de compte : <strong>Compte individuel</strong>
        </p>
        <div className="text-[13px] space-y-1 border border-[#0B1B59]/10 rounded-xl p-4">
          <p className="font-bold text-[12px] uppercase text-[#0B1B59]/50">Mandataire</p>
          <p>
            {[m.prenoms, m.nom].filter(Boolean).join(" ") || "—"}
          </p>
          <p>{m.adresse || "—"}</p>
          <p>
            {m.pieceIdentiteNumero || "—"} · {m.telephone || "—"}
          </p>
        </div>
        <QuestionnaireSummary data={data} />
        <p className="text-[13px]">
          Fait à <strong>{opening.faitA || "Dakar"}</strong>, le{" "}
          <strong>{opening.faitLe ? opening.faitLe.split("-").reverse().join("/") : "—"}</strong>
        </p>
        <p className="text-[13px]">
          Attestation : {opening.attestationExactitude ? "Oui" : "Non"}
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
          Valider et enregistrer le document
        </button>
      </div>
    </div>
  );
}
