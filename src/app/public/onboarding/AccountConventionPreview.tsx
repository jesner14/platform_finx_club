import { Loader2 } from "lucide-react";
import type { AccountConvention, Questionnaire } from "./types";

type Props = {
  data: Questionnaire;
  convention: AccountConvention;
  saving: boolean;
  error: string | null;
  onEdit: () => void;
  onConfirm: () => Promise<void>;
};

export function AccountConventionPreview({ data, convention, saving, error, onEdit, onConfirm }: Props) {
  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <div className="rounded-xl bg-[#0B1B59]/5 border border-[#0B1B59]/10 px-4 py-3 text-[13px]">
        Vérifiez la convention. Après validation, le PDF 004 est enregistré et l’étape 005 s’ouvre.
      </div>

      <article className="rounded-2xl bg-white border border-[#0B1B59]/10 px-5 py-6 space-y-3">
        <h3 className="font-display text-lg font-bold uppercase text-center">Convention d’ouverture de compte</h3>
        <p className="text-[13px] text-center">Personne physique · Compte individuel · Gestion sous mandat</p>
        <p className="text-[13px]">
          Client : <strong>{`${data.prenoms || ""} ${data.nom || ""}`.trim() || "—"}</strong>
        </p>
        <p className="text-[13px]">N° de compte : À attribuer</p>
        <p className="text-[13px]">
          Acceptation convention : {convention.accepteConvention ? "Oui" : "Non"} · Tarifs :{" "}
          {convention.accepteTarifs ? "Oui" : "Non"}
        </p>
        <p className="text-[13px]">
          Fait à <strong>{convention.faitA || "Dakar"}</strong>, le{" "}
          <strong>{convention.faitLe ? convention.faitLe.split("-").reverse().join("/") : "—"}</strong>
        </p>
        <p className="text-[12px] text-[#0B1B59]/55">
          La signature du carton de l’étape 2 sera apposée sur le document PDF généré.
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
