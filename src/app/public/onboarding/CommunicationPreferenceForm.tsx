import { Loader2 } from "lucide-react";
import type { CommunicationPreference, Questionnaire } from "./types";

type Props = {
  data: Questionnaire;
  preference: CommunicationPreference;
  onChange: (next: CommunicationPreference) => void;
  saving: boolean;
  error: string | null;
  onContinue: () => void;
};

const MODES = [
  { value: "COURRIER", label: "Courrier" },
  { value: "EMAIL", label: "Email" },
] as const;

export function CommunicationPreferenceForm({
  data,
  preference,
  onChange,
  saving,
  error,
  onContinue,
}: Props) {
  const toggle = (mode: string) => {
    const has = preference.modes.includes(mode);
    const modes = has ? preference.modes.filter((m) => m !== mode) : [...preference.modes, mode];
    onChange({ ...preference, modes });
  };

  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <p className="text-[13px] text-[#0B1B59]/60">
        Indiquez comment FINX peut vous transmettre les informations liées à votre relation. Au moins un mode est
        requis.
      </p>

      <section className="rounded-2xl bg-white border border-[#0B1B59]/10 p-5 space-y-3 text-[13px]">
        <h3 className="font-display text-lg font-bold">Préférence de communication</h3>
        <p>N° de compte : <strong>À attribuer</strong></p>
        <p>
          {`${data.prenoms || ""} ${data.nom || ""}`.trim() || "—"} · {data.email || "—"} · {data.telephone || "—"}
        </p>
        <p className="text-[#0B1B59]/70">{data.adresse || "—"}</p>
      </section>

      <section className="rounded-2xl bg-white border border-[#0B1B59]/10 p-5 space-y-4">
        <p className="font-semibold text-[13px]">Mode de communication</p>
        {MODES.map((item) => (
          <label key={item.value} className="flex items-center gap-3 text-[13px] cursor-pointer">
            <input
              type="checkbox"
              checked={preference.modes.includes(item.value)}
              onChange={() => toggle(item.value)}
            />
            <span>{item.label}</span>
          </label>
        ))}
        <p className="text-[13px] text-[#0B1B59]/70 leading-relaxed">
          Par le présent document, je donne à FINX l’autorisation de me transmettre toutes les informations dans le
          cadre de la relation qui nous lie par le mode de communication choisi ci-dessus.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block text-[13px]">
            <span className="font-semibold">Fait à</span>
            <input
              value={preference.faitA}
              onChange={(e) => onChange({ ...preference, faitA: e.target.value })}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-[#0B1B59]/15 bg-white"
            />
          </label>
          <label className="block text-[13px]">
            <span className="font-semibold">Le</span>
            <input
              type="date"
              value={preference.faitLe ?? ""}
              onChange={(e) => onChange({ ...preference, faitLe: e.target.value || null })}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-[#0B1B59]/15 bg-white"
            />
          </label>
        </div>
      </section>

      {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p> : null}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving || preference.modes.length === 0 || !preference.faitLe}
          onClick={onContinue}
          className="h-11 px-6 rounded-full bg-[#F5D251] text-[#0B1B59] text-sm font-bold disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : null}
          Valider et terminer le dossier
        </button>
      </div>
    </div>
  );
}
