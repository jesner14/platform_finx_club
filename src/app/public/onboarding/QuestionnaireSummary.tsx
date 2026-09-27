import {
  BAISSES,
  CANAUX,
  CIVILITES,
  CLASSIFICATIONS,
  COMPREHENSIONS,
  DECES,
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
import type { Questionnaire } from "./types";

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
    <section className="mt-5">
      <h3 className="font-display text-[15px] font-bold text-[#0B1B59] border-b-2 border-[#F5D251] pb-1 mb-2">{title}</h3>
      {children}
    </section>
  );
}

export function QuestionnaireSummary({ data, showRisk = true }: { data: Questionnaire; showRisk?: boolean }) {
  const contacts =
    data.contactsUrgence
      ?.filter((c) => c.nom || c.prenoms || c.telephone)
      .map((c) => `${c.nom} ${c.prenoms}`.trim() + (c.telephone ? ` — ${c.telephone}` : ""))
      .join("\n") || "—";

  return (
    <div>
      <Section title="Informations sur le titulaire">
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
          value={`${labelOf(STATUTS_MATRIMONIAUX, data.statutMatrimonial)}${data.statutMatrimonialPrecision ? ` (${data.statutMatrimonialPrecision})` : ""}`}
        />
        <Row
          label="Classification"
          value={`${labelOf(CLASSIFICATIONS, data.classification)}${data.classificationPrecision ? ` (${data.classificationPrecision})` : ""}`}
        />
        <Row label="Profession" value={data.profession} />
        <Row label="Employeur" value={data.employeur} />
        <Row label="Contacts d’urgence" value={contacts} />
        <Row
          label="En cas de décès"
          value={`${labelOf(DECES, data.decesDestination)}${data.decesPersonneNom ? ` — ${data.decesPersonneNom}` : ""}`}
        />
      </Section>

      {showRisk ? (
        <Section title="Profil de risque">
          <Row label="Revenu mensuel" value={labelOf(REVENUS, data.revenuMensuel)} />
          <Row label="Montant envisagé" value={labelOf(MONTANTS, data.montantInvestir)} />
          <Row
            label="Provenance des fonds"
            value={`${labelsOf(PROVENANCES, data.provenanceFonds)}${data.provenanceFondsPrecision ? ` (${data.provenanceFondsPrecision})` : ""}`}
          />
          <Row label="Objectif" value={labelOf(OBJECTIFS, data.objectifInvestissement)} />
          <Row label="Communication" value={labelsOf(CANAUX, data.communicationCanaux)} />
          <Row label="Compréhension" value={labelOf(COMPREHENSIONS, data.niveauComprehension)} />
          <Row label="Situation financière" value={labelOf(SITUATIONS, data.situationFinanciere)} />
          <Row label="Économies" value={labelOf(EPARGNES, data.epargneActuelle)} />
          <Row label="Horizon" value={labelOf(HORIZONS, data.horizonFonds)} />
          <Row label="Fréquence de suivi" value={labelOf(FREQUENCES, data.frequenceSuivi)} />
          <Row
            label="Placements"
            value={`${labelsOf(PLACEMENTS, data.placementsDetenus)}${data.placementsPrecision ? ` (${data.placementsPrecision})` : ""}`}
          />
          <Row label="Tolérance au risque" value={labelOf(TOLERANCES, data.toleranceRisque)} />
          <Row label="Baisse acceptable" value={labelOf(BAISSES, data.baisseAcceptee)} />
        </Section>
      ) : null}
    </div>
  );
}
