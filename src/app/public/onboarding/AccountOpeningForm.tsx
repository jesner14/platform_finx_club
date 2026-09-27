import { Loader2 } from "lucide-react";
import { QuestionnaireSummary } from "./QuestionnaireSummary";
import type { AccountOpening, Questionnaire } from "./types";

type Props = {
  data: Questionnaire;
  opening: AccountOpening;
  onChange: (next: AccountOpening) => void;
  saving: boolean;
  error: string | null;
  onContinue: () => void;
};

export function AccountOpeningForm({ data, opening, onChange, saving, error, onContinue }: Props) {
  const set = <K extends keyof AccountOpening>(key: K, value: AccountOpening[K]) =>
    onChange({ ...opening, [key]: value });

  const setMandataire = (key: keyof AccountOpening["mandataire"], value: string) =>
    onChange({ ...opening, mandataire: { ...opening.mandataire, [key]: value } });

  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <p className="text-[13px] text-[#0B1B59]/60">
        Les informations d’identité et de profil de risque sont reprises de l’étape 1. Complétez le mandataire si
        besoin, puis attestez l’exactitude des informations.
      </p>

      <section className="rounded-2xl bg-white border border-[#0B1B59]/10 p-5 space-y-4">
        <h3 className="font-display text-lg font-bold">1. Caractéristiques du compte</h3>
        <p className="text-[13px]">
          Type de compte : <span className="font-semibold">Compte individuel</span>
        </p>
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#0B1B59]/50">Mandataire (optionnel)</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              ["nom", "Nom(s)"],
              ["prenoms", "Prénom(s)"],
              ["adresse", "Adresse"],
              ["pieceIdentiteNumero", "N° de pièce d’identité"],
              ["telephone", "Numéro de téléphone"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-[13px]">
              <span className="font-semibold">{label}</span>
              <input
                value={opening.mandataire[key]}
                onChange={(e) => setMandataire(key, e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-xl border border-[#0B1B59]/15 bg-white"
              />
            </label>
          ))}
        </div>
      </section>

      <article className="rounded-2xl bg-white border border-[#0B1B59]/10 px-5 py-5 max-h-[48vh] overflow-y-auto">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#0B1B59]/45 mb-2">
          2–3. Titulaire et profil (étape 1)
        </p>
        <QuestionnaireSummary data={data} />
      </article>

      <section className="rounded-2xl bg-white border border-[#0B1B59]/10 p-5 space-y-4">
        <h3 className="font-display text-lg font-bold">4. Dispositions particulières</h3>
        <p className="text-[13px] text-[#0B1B59]/70 leading-relaxed">
          Le client est prié de remettre la photocopie de sa carte d’identité ou de son passeport au conseiller en
          placement. Le soussigné déclare que toutes les informations renseignées sont exactes et complètes, et
          s’engage à informer FINX par écrit de tout changement.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-[13px]">
            <span className="font-semibold">Fait à</span>
            <input
              value={opening.faitA}
              onChange={(e) => set("faitA", e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-[#0B1B59]/15 bg-white"
            />
          </label>
          <label className="block text-[13px]">
            <span className="font-semibold">Le</span>
            <input
              type="date"
              value={opening.faitLe ?? ""}
              onChange={(e) => set("faitLe", e.target.value || null)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-[#0B1B59]/15 bg-white"
            />
          </label>
        </div>
        <label className="flex items-start gap-3 text-[13px] cursor-pointer">
          <input
            type="checkbox"
            checked={opening.attestationExactitude}
            onChange={(e) => set("attestationExactitude", e.target.checked)}
            className="mt-1"
          />
          <span>J’atteste que les informations de cette demande d’ouverture sont exactes et complètes.</span>
        </label>
      </section>

      {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p> : null}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving || !opening.attestationExactitude || !opening.faitLe}
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
