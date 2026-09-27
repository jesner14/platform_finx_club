import { Loader2 } from "lucide-react";
import { IdentityPhoto } from "./IdentityPhoto";
import type { InvestorApplication, Questionnaire } from "./types";

type Props = {
  application: InvestorApplication;
  data: Questionnaire;
  signatureDataUrl: string;
  saving: boolean;
  error: string | null;
  onEdit: () => void;
  onConfirm: () => Promise<void>;
};

export function SignatureCardPreview({
  application,
  data,
  signatureDataUrl,
  saving,
  error,
  onEdit,
  onConfirm,
}: Props) {
  const photo = application.documents.find((doc) => doc.kind === "PHOTO_IDENTITE");
  const fullName = `${data.prenoms || ""} ${data.nom || ""}`.trim() || "—";

  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <div className="rounded-xl bg-[#0B1B59]/5 border border-[#0B1B59]/10 px-4 py-3 text-[13px]">
        Vérifiez le carton de signature. Après validation, le PDF est enregistré et l’étape suivante s’ouvre.
      </div>

      <article className="rounded-2xl bg-white border border-[#0B1B59]/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#0B1B59]/08 text-center">
          <p className="text-[12px] font-bold">FINX | Société par Actions Simplifiée</p>
          <h3 className="mt-3 font-display text-lg font-bold uppercase">Carton de signature</h3>
          <p className="text-[12px] text-[#0B1B59]/50">Personne physique · Compte individuel · Gestion sous mandat</p>
        </div>
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#0B1B59]/10">
          <div className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B1B59]/55 mb-3">Prénom(s) et nom</p>
            <p className="font-display text-xl font-bold">{fullName}</p>
          </div>
          <div className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B1B59]/55 mb-3">Spécimens de signature</p>
            <img src={signatureDataUrl} alt="Signature" className="w-full h-40 object-contain rounded-xl border border-[#0B1B59]/10 bg-white" />
          </div>
          <div className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B1B59]/55 mb-3">Photos</p>
            <IdentityPhoto applicationId={application.id} photo={photo} className="w-full max-h-56 aspect-[3/4]" />
          </div>
        </div>
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
