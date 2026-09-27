import {
  BAISSES,
  CANAUX,
  CIVILITES,
  CLASSIFICATIONS,
  COMPREHENSIONS,
  DECES,
  DOCUMENT_KINDS,
  EPARGNES,
  FREQUENCES,
  HORIZONS,
  MONTANTS,
  OBJECTIFS,
  PIECES,
  PLACEMENTS,
  PROVENANCES,
  REVENUS,
  SITUATIONS,
  STATUTS_MATRIMONIAUX,
  TOLERANCES,
} from "./constants";
import type { InvestorApplication, Questionnaire } from "./types";

function labelOf(options: { value: string; label: string }[], value: string | null | undefined) {
  if (!value) return "—";
  return options.find((item) => item.value === value)?.label ?? value;
}

function labelsOf(options: { value: string; label: string }[], values: string[] | null | undefined) {
  if (!values?.length) return "—";
  return values.map((value) => labelOf(options, value)).join(", ");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[38%_1fr] gap-2 border-b border-[#0B1B59]/10 py-2 text-[13px]">
      <p className="font-semibold text-[#0B1B59]/70">{label}</p>
      <p className="text-[#0B1B59] whitespace-pre-wrap">{value || "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="font-display text-[15px] font-bold text-[#0B1B59] border-b-2 border-[#F5D251] pb-1 mb-2">{title}</h3>
      {children}
    </section>
  );
}

type Props = {
  data: Questionnaire;
  application: InvestorApplication;
  saving: boolean;
  error: string | null;
  onEdit: () => void;
  onConfirm: () => Promise<void>;
};

export function QuestionnairePreview({ data, application, saving, error, onEdit, onConfirm }: Props) {
  const contacts =
    data.contactsUrgence
      ?.filter((c) => c.nom || c.prenoms || c.telephone)
      .map((c) => `${c.nom} ${c.prenoms}`.trim() + (c.telephone ? ` — ${c.telephone}` : ""))
      .join("\n") || "—";

  const pieces = DOCUMENT_KINDS.map((item) => {
    const file = application.documents.find((doc) => doc.kind === item.kind);
    return `${item.title} : ${file ? file.originalFilename : "manquant"}`;
  }).join("\n");

  return (
    <div className="space-y-5" style={{ color: "#0B1B59" }}>
      <div className="rounded-xl bg-[#0B1B59]/5 border border-[#0B1B59]/10 px-4 py-3 text-[13px]">
        Vérifiez le document rempli ci-dessous. Après validation, le PDF est enregistré en base et vous passez à
        l’étape suivante.
      </div>

      <article className="rounded-2xl bg-white border border-[#0B1B59]/10 shadow-sm px-5 sm:px-8 py-7 max-h-[70vh] overflow-y-auto">
        <p className="text-center text-[12px] font-bold text-[#0B1B59]">FINX | Société par Actions Simplifiée</p>
        <p className="text-center text-[11px] text-[#0B1B59]/55 mt-1">
          1, Liberté 6 Extension, Dakar, Sénégal · Tél. : +221 78 194 75 93
          <br />
          RC : SN DKR 2024 B 23429 · NINEA : 011288794
        </p>
        <h2 className="mt-5 text-center font-display text-lg font-bold uppercase tracking-wide">
          Fiche d’identification et de connaissance du client
        </h2>
        <p className="text-center text-[12px] text-[#0B1B59]/55 mt-1">
          Personne physique · Compte individuel · Gestion sous mandat
        </p>

        <Section title="1. Informations sur le titulaire du compte">
          <Row label="Civilité" value={labelOf(CIVILITES, data.civilite)} />
          <Row label="Nom(s)" value={data.nom} />
          <Row label="Prénom(s)" value={data.prenoms} />
          <Row
            label="Date et lieu de naissance"
            value={`${formatDate(data.dateNaissance)} — ${data.lieuNaissance || "—"}`}
          />
          <Row label="Adresse" value={data.adresse} />
          <Row label="Pièce d’identité" value={labelOf(PIECES, data.pieceIdentiteType)} />
          <Row label="N° pièce" value={data.pieceIdentiteNumero} />
          <Row
            label="Délivrance / Expiration"
            value={`${formatDate(data.pieceIdentiteDelivrance)} / ${formatDate(data.pieceIdentiteExpiration)}`}
          />
          <Row label="Nationalité(s)" value={data.nationalites} />
          <Row label="Email" value={data.email} />
          <Row label="Téléphone" value={data.telephone} />
          <Row
            label="Statut matrimonial"
            value={
              labelOf(STATUTS_MATRIMONIAUX, data.statutMatrimonial) +
              (data.statutMatrimonialPrecision ? ` (${data.statutMatrimonialPrecision})` : "")
            }
          />
          <Row
            label="Classification"
            value={
              labelOf(CLASSIFICATIONS, data.classification) +
              (data.classificationPrecision ? ` (${data.classificationPrecision})` : "")
            }
          />
        </Section>

        <Section title="Situation professionnelle">
          <Row label="Profession / Activité" value={data.profession} />
          <Row label="Employeur" value={data.employeur} />
          <Row label="Secteur d’activité" value={data.secteurActivite} />
          <Row label="Adresse employeur" value={data.adresseEmployeur} />
          <Row label="Ancienneté" value={data.ancienneteEntreprise} />
          <Row label="Employeur précédent" value={data.employeurPrecedent} />
          <Row label="Contacts d’urgence" value={contacts} />
          <Row
            label="En cas de décès"
            value={
              labelOf(DECES, data.decesDestination) +
              (data.decesPersonneNom ? ` — ${data.decesPersonneNom}` : "")
            }
          />
        </Section>

        <Section title="2. Profil de risque">
          <Row label="Revenu mensuel net" value={labelOf(REVENUS, data.revenuMensuel)} />
          <Row label="Montant envisagé" value={labelOf(MONTANTS, data.montantInvestir)} />
          <Row
            label="Provenance des fonds"
            value={
              labelsOf(PROVENANCES, data.provenanceFonds) +
              (data.provenanceFondsPrecision ? ` (${data.provenanceFondsPrecision})` : "")
            }
          />
          <Row label="Objectif principal" value={labelOf(OBJECTIFS, data.objectifInvestissement)} />
          <Row label="Communication" value={labelsOf(CANAUX, data.communicationCanaux)} />
          <Row label="Compréhension placements" value={labelOf(COMPREHENSIONS, data.niveauComprehension)} />
          <Row label="Situation financière" value={labelOf(SITUATIONS, data.situationFinanciere)} />
          <Row label="Économies actuelles" value={labelOf(EPARGNES, data.epargneActuelle)} />
          <Row label="Horizon des fonds" value={labelOf(HORIZONS, data.horizonFonds)} />
          <Row label="Fréquence de suivi" value={labelOf(FREQUENCES, data.frequenceSuivi)} />
          <Row
            label="Placements détenus"
            value={
              labelsOf(PLACEMENTS, data.placementsDetenus) +
              (data.placementsPrecision ? ` (${data.placementsPrecision})` : "")
            }
          />
          <Row label="Tolérance au risque" value={labelOf(TOLERANCES, data.toleranceRisque)} />
          <Row label="Baisse acceptable" value={labelOf(BAISSES, data.baisseAcceptee)} />
        </Section>

        <Section title="3. Pièces jointes">
          <Row label="Documents" value={pieces} />
        </Section>
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
          className="h-11 px-6 rounded-full bg-[#F5D251] text-[#0B1B59] text-sm font-bold"
        >
          {saving ? "Enregistrement…" : "Valider et enregistrer le document"}
        </button>
      </div>
    </div>
  );
}
