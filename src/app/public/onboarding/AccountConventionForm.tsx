import { Loader2 } from "lucide-react";
import { DECES } from "./constants";
import { QuestionnaireSummary } from "./QuestionnaireSummary";
import type { AccountConvention, Questionnaire } from "./types";

type Props = {
  data: Questionnaire;
  convention: AccountConvention;
  onChange: (next: AccountConvention) => void;
  saving: boolean;
  error: string | null;
  onContinue: () => void;
};

const ARTICLES = [
  {
    title: "Préambule & loi applicable",
    text: "FINX intervient en qualité de mandataire. Le compte n’est ouvert qu’au vu de la présente convention signée.",
  },
  {
    title: "Confidentialité & responsabilité",
    text: "Obligation de discrétion absolue. Le client déclare sa pleine capacité juridique. Modifications par lettre recommandée avec AR. Force majeure exclue.",
  },
  {
    title: "Compte individuel & détention des titres",
    text: "Compte individuel. Titres dématérialisés inscrits au compte-titres FINX CLUB (GIE), participation en parts au prorata.",
  },
  {
    title: "Mandat de gestion & fiscalité",
    text: "Mandat de gestion confié à FINX. Fiscalité en vigueur appliquée au versement des revenus.",
  },
  {
    title: "Tarifs, durée, reporting",
    text: "Facturation selon la grille ci-dessous. Convention à durée indéterminée, résiliable sous 45 jours. Reporting trimestriel.",
  },
];

const TARIFFS = [
  ["Commission de gestion sous mandat", "1% annuel"],
  ["Courtage SGI (CGF / ICF)", "1% / 0,9%"],
  ["Rétrocession courtage Actions BRVM", "0,2% TTC"],
  ["Conservation de titres", "0,25%"],
  ["Ouverture / clôture / tenue de compte", "0 FCFA"],
];

export function AccountConventionForm({ data, convention, onChange, saving, error, onContinue }: Props) {
  const set = <K extends keyof AccountConvention>(key: K, value: AccountConvention[K]) =>
    onChange({ ...convention, [key]: value });

  const decesLabel =
    DECES.find((item) => item.value === data.decesDestination)?.label ?? data.decesDestination ?? "—";

  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <p className="text-[13px] text-[#0B1B59]/60">
        Lisez la convention, acceptez ses termes et la grille tarifaire. Votre identité et le bénéficiaire en cas de
        décès sont repris de l’étape 1. La signature du carton (étape 2) sera apposée sur le PDF.
      </p>

      <section className="rounded-2xl bg-white border border-[#0B1B59]/10 p-5 space-y-3">
        <h3 className="font-display text-lg font-bold">Convention d’ouverture de compte</h3>
        <p className="text-[13px]">
          N° de compte : <span className="font-semibold">À attribuer</span>
        </p>
        <div className="max-h-[36vh] overflow-y-auto pr-1 space-y-3">
          {ARTICLES.map((article) => (
            <div key={article.title} className="border-b border-[#0B1B59]/08 pb-3">
              <p className="font-semibold text-[13px]">{article.title}</p>
              <p className="text-[13px] text-[#0B1B59]/70 mt-1 leading-relaxed">{article.text}</p>
            </div>
          ))}
          <div>
            <p className="font-semibold text-[13px] mb-2">Grille de tarification (extrait)</p>
            <div className="space-y-1">
              {TARIFFS.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 text-[12px] border-b border-[#0B1B59]/08 py-1.5">
                  <span>{label}</span>
                  <span className="font-semibold whitespace-nowrap">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[13px]">
            En cas de décès, le solde sera remis : <strong>{decesLabel}</strong>
            {data.decesPersonneNom ? ` — ${data.decesPersonneNom}` : ""}
          </p>
        </div>
      </section>

      <article className="rounded-2xl bg-white border border-[#0B1B59]/10 px-5 py-4 max-h-[28vh] overflow-y-auto">
        <p className="text-[12px] font-bold uppercase tracking-wide text-[#0B1B59]/45 mb-2">Identité du client</p>
        <QuestionnaireSummary data={data} showRisk={false} />
      </article>

      <section className="rounded-2xl bg-white border border-[#0B1B59]/10 p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-[13px]">
            <span className="font-semibold">Fait à</span>
            <input
              value={convention.faitA}
              onChange={(e) => set("faitA", e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-[#0B1B59]/15 bg-white"
            />
          </label>
          <label className="block text-[13px]">
            <span className="font-semibold">Le</span>
            <input
              type="date"
              value={convention.faitLe ?? ""}
              onChange={(e) => set("faitLe", e.target.value || null)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-[#0B1B59]/15 bg-white"
            />
          </label>
        </div>
        <label className="flex items-start gap-3 text-[13px] cursor-pointer">
          <input
            type="checkbox"
            checked={convention.accepteConvention}
            onChange={(e) => set("accepteConvention", e.target.checked)}
            className="mt-1"
          />
          <span>J’accepte les termes de la convention d’ouverture de compte.</span>
        </label>
        <label className="flex items-start gap-3 text-[13px] cursor-pointer">
          <input
            type="checkbox"
            checked={convention.accepteTarifs}
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
          disabled={saving || !convention.accepteConvention || !convention.accepteTarifs || !convention.faitLe}
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
