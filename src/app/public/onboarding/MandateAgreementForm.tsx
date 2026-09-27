import { Loader2 } from "lucide-react";
import { DECES } from "./constants";
import { QuestionnaireSummary } from "./QuestionnaireSummary";
import type { MandateAgreement, Questionnaire } from "./types";

type Props = {
  data: Questionnaire;
  mandate: MandateAgreement;
  onChange: (next: MandateAgreement) => void;
  saving: boolean;
  error: string | null;
  onContinue: () => void;
};

const HORIZONS = [
  { value: "COURT", label: "Court terme (1 an)" },
  { value: "MOYEN", label: "Moyen terme (entre 1 et 3 ans)" },
  { value: "LONG", label: "Long terme (3 et plus)" },
] as const;

export function MandateAgreementForm({ data, mandate, onChange, saving, error, onContinue }: Props) {
  const set = <K extends keyof MandateAgreement>(key: K, value: MandateAgreement[K]) =>
    onChange({ ...mandate, [key]: value });

  const decesLabel =
    DECES.find((item) => item.value === data.decesDestination)?.label ?? data.decesDestination ?? "—";

  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <p className="text-[13px] text-[#0B1B59]/60">
        Lisez la convention de gestion sous mandat. Le profil produit est Audacieux. Choisissez l’horizon, acceptez
        les termes et la grille tarifaire. La signature de l’étape 2 sera apposée sur le PDF.
      </p>

      <section className="rounded-2xl bg-white border border-[#0B1B59]/10 p-5 space-y-3">
        <h3 className="font-display text-lg font-bold">Convention de gestion sous mandat</h3>
        <p className="text-[13px]">N° de compte : <span className="font-semibold">À attribuer</span></p>
        <div className="max-h-[32vh] overflow-y-auto space-y-3 pr-1 text-[13px] text-[#0B1B59]/75 leading-relaxed">
          <p>
            <strong>Objet :</strong> mandat discrétionnaire confié à FINX pour gérer le patrimoine (souscriptions,
            ordres, transferts, placements monétaires).
          </p>
          <p>
            <strong>Profil :</strong> Audacieux — forte tolérance au risque, objectif de croissance optimale à long
            terme.
          </p>
          <p>
            <strong>Exécution :</strong> FINX agit au mieux des intérêts du mandant, sans obligation de résultat.
            Le mandant reconnaît les risques de marché et s’engage à communiquer toute information utile (LCB-FT).
          </p>
          <p>
            En cas de décès : <strong>{decesLabel}</strong>
            {data.decesPersonneNom ? ` — ${data.decesPersonneNom}` : ""}
          </p>
          <div>
            <p className="font-semibold text-[#0B1B59] mb-1">Grille tarifaire (extrait)</p>
            <p>Commission de gestion sous mandat : 1% annuel · Conservation : 0,25% · Ouverture/clôture : 0 FCFA</p>
          </div>
        </div>
      </section>

      <article className="rounded-2xl bg-white border border-[#0B1B59]/10 px-5 py-4 max-h-[24vh] overflow-y-auto">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#0B1B59]/45 mb-2">Identité du mandant</p>
        <QuestionnaireSummary data={data} showRisk={false} />
      </article>

      <section className="rounded-2xl bg-white border border-[#0B1B59]/10 p-5 space-y-4">
        <p className="font-semibold text-[13px]">Horizon de placement</p>
        <div className="space-y-2">
          {HORIZONS.map((item) => (
            <label key={item.value} className="flex items-center gap-3 text-[13px] cursor-pointer">
              <input
                type="radio"
                name="horizon"
                checked={mandate.horizonPlacement === item.value}
                onChange={() => set("horizonPlacement", item.value)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-[13px]">
            <span className="font-semibold">Fait à</span>
            <input
              value={mandate.faitA}
              onChange={(e) => set("faitA", e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-[#0B1B59]/15 bg-white"
            />
          </label>
          <label className="block text-[13px]">
            <span className="font-semibold">Le</span>
            <input
              type="date"
              value={mandate.faitLe ?? ""}
              onChange={(e) => set("faitLe", e.target.value || null)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-[#0B1B59]/15 bg-white"
            />
          </label>
        </div>
        <label className="flex items-start gap-3 text-[13px] cursor-pointer">
          <input
            type="checkbox"
            checked={mandate.accepteMandat}
            onChange={(e) => set("accepteMandat", e.target.checked)}
            className="mt-1"
          />
          <span>J’accepte les termes de la convention de gestion sous mandat.</span>
        </label>
        <label className="flex items-start gap-3 text-[13px] cursor-pointer">
          <input
            type="checkbox"
            checked={mandate.accepteTarifs}
            onChange={(e) => set("accepteTarifs", e.target.checked)}
            className="mt-1"
          />
          <span>J’ai pris connaissance de la grille de tarification et j’en accepte tous les termes.</span>
        </label>
      </section>

      {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p> : null}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving || !mandate.accepteMandat || !mandate.accepteTarifs || !mandate.faitLe}
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
