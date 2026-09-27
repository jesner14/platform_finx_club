import { Loader2 } from "lucide-react";
import { IdentityPhoto } from "./IdentityPhoto";
import { SignaturePad } from "./SignaturePad";
import type { InvestorApplication, Questionnaire } from "./types";

type Props = {
  application: InvestorApplication;
  data: Questionnaire;
  signatureDataUrl: string | null;
  onSignatureChange: (value: string | null) => void;
  saving: boolean;
  error: string | null;
  onContinue: () => void;
};

export function SignatureCardForm({
  application,
  data,
  signatureDataUrl,
  onSignatureChange,
  saving,
  error,
  onContinue,
}: Props) {
  const photo = application.documents.find((doc) => doc.kind === "PHOTO_IDENTITE");
  const fullName = `${data.prenoms || ""} ${data.nom || ""}`.trim() || "—";

  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <p className="text-[13px] text-[#0B1B59]/60">
        Signez dans le cadre. La photo reprise ci-dessous est celle jointe à l’étape 1.
      </p>

      <article className="rounded-2xl bg-white border border-[#0B1B59]/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#0B1B59]/08 text-center">
          <p className="text-[12px] font-bold">FINX | Société par Actions Simplifiée</p>
          <p className="text-[11px] text-[#0B1B59]/50 mt-1">
            1, Liberté 6 Extension, Dakar · RC SN DKR 2024 B 23429 · NINEA 011288794
          </p>
          <h3 className="mt-3 font-display text-lg font-bold uppercase">Carton de signature</h3>
          <p className="text-[12px] text-[#0B1B59]/50">Personne physique · Compte individuel · Gestion sous mandat</p>
        </div>

        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#0B1B59]/10">
          <div className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B1B59]/55 mb-3">Prénom(s) et nom</p>
            <p className="font-display text-xl font-bold">{fullName}</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B1B59]/55 mb-3">Spécimens de signature</p>
            <SignaturePad value={signatureDataUrl} onChange={onSignatureChange} />
          </div>
          <div className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B1B59]/55 mb-3">Photos</p>
            <IdentityPhoto applicationId={application.id} photo={photo} className="w-full max-h-56 aspect-[3/4]" />
          </div>
        </div>
      </article>

      {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p> : null}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving || !signatureDataUrl}
          onClick={onContinue}
          className="h-11 px-6 rounded-full bg-[#F5D251] text-[#0B1B59] text-sm font-bold disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : null}
          Valider et continuer
        </button>
      </div>
    </div>
  );
}
