import { useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
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
import type { DocumentKind, EmergencyContact, InvestorApplication, Questionnaire } from "./types";

const SECTIONS = [
  { id: "identite", label: "Identité" },
  { id: "pro", label: "Situation pro" },
  { id: "risque", label: "Profil de risque" },
  { id: "pieces", label: "Pièces" },
] as const;

type Props = {
  application: InvestorApplication;
  data: Questionnaire;
  onChange: (next: Questionnaire) => void;
  onSaveDraft: () => Promise<void>;
  onUpload: (kind: DocumentKind, file: File) => Promise<void>;
  onDeleteDocument: (documentId: number) => Promise<void>;
  onComplete: () => Promise<void>;
  saving: boolean;
  error: string | null;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block space-y-1.5">
      <p className="text-[12px] font-semibold text-[#0B1B59]/70">{label}</p>
      {children}
    </div>
  );
}

const inputClass =
  "w-full h-11 rounded-xl border border-[#0B1B59]/12 bg-white px-3 text-sm text-[#0B1B59] placeholder:text-[#0B1B59]/35 focus:outline-none focus:border-[#F5D251] focus:ring-2 focus:ring-[#F5D251]/30";

function ChoiceGrid({
  options,
  value,
  onChange,
  multiple,
  name,
}: {
  options: { value: string; label: string; hint?: string }[];
  value: string | string[];
  onChange: (next: string | string[]) => void;
  multiple?: boolean;
  name: string;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const withHints = options.some((option) => option.hint);
  return (
    <div className={withHints ? "grid gap-2.5" : "flex flex-wrap gap-x-6 gap-y-2"}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <label
            key={option.value}
            className={`inline-flex items-start gap-2 cursor-pointer text-[14px] leading-snug ${
              withHints ? "max-w-3xl" : ""
            }`}
            style={{ color: "#0B1B59" }}
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              name={multiple ? `${name}-${option.value}` : name}
              checked={active}
              onChange={() => {
                if (multiple) {
                  onChange(active ? selected.filter((item) => item !== option.value) : [...selected, option.value]);
                } else {
                  onChange(option.value);
                }
              }}
              className="finx-choice mt-0.5 shrink-0"
            />
            <span>
              <span className="font-medium">{option.label}</span>
              {option.hint ? (
                <span className="block mt-0.5 text-[12px] font-normal" style={{ color: "rgba(11,27,89,0.62)" }}>
                  {option.hint}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function QuestionnaireForm({
  application,
  data,
  onChange,
  onSaveDraft,
  onUpload,
  onDeleteDocument,
  onComplete,
  saving,
  error,
}: Props) {
  const [section, setSection] = useState(0);
  const [uploading, setUploading] = useState<DocumentKind | null>(null);
  const patch = (partial: Partial<Questionnaire>) => onChange({ ...data, ...partial });
  const patchContact = (index: number, partial: Partial<EmergencyContact>) => {
    const contacts = data.contactsUrgence.map((item, i) => (i === index ? { ...item, ...partial } : item));
    patch({ contactsUrgence: contacts });
  };

  return (
    <div className="space-y-6" style={{ color: "#0B1B59", colorScheme: "light" }}>
      <style>{`
        .finx-choice {
          appearance: none;
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          margin: 2px 0 0;
          border: 1.5px solid #0B1B59;
          background-color: #ffffff !important;
          color-scheme: light;
          vertical-align: top;
        }
        .finx-choice[type="radio"] { border-radius: 50%; }
        .finx-choice[type="checkbox"] { border-radius: 3px; }
        .finx-choice:checked[type="radio"] {
          background-image: radial-gradient(circle, #0B1B59 0 4px, #ffffff 4.5px 100%);
        }
        .finx-choice:checked[type="checkbox"] {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%230B1B59' stroke-width='2' d='M3.5 8.5l3 3 6-6'/%3E%3C/svg%3E");
          background-size: 12px 12px;
          background-position: center;
          background-repeat: no-repeat;
        }
      `}</style>
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(index)}
            className={`h-9 px-3 rounded-full text-[12px] font-semibold ${
              section === index ? "bg-[#0B1B59] text-white" : "bg-[#0B1B59]/8 text-[#0B1B59]/70"
            }`}
          >
            {index + 1}. {item.label}
          </button>
        ))}
      </div>

      {section === 0 ? (
        <div className="space-y-5">
          <h3 className="font-display text-lg font-bold text-[#0B1B59]">1. Informations sur le titulaire du compte</h3>
          <Field label="Civilité">
            <ChoiceGrid name="civilite" options={CIVILITES} value={data.civilite} onChange={(v) => patch({ civilite: String(v) })} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nom(s)">
              <input className={inputClass} value={data.nom} onChange={(e) => patch({ nom: e.target.value })} />
            </Field>
            <Field label="Prénom(s)">
              <input className={inputClass} value={data.prenoms} onChange={(e) => patch({ prenoms: e.target.value })} />
            </Field>
            <Field label="Date de naissance">
              <input
                type="date"
                className={inputClass}
                value={data.dateNaissance ?? ""}
                onChange={(e) => patch({ dateNaissance: e.target.value || null })}
              />
            </Field>
            <Field label="Lieu de naissance">
              <input className={inputClass} value={data.lieuNaissance} onChange={(e) => patch({ lieuNaissance: e.target.value })} />
            </Field>
          </div>
          <Field label="Adresse">
            <textarea
              className={`${inputClass} h-24 py-2`}
              value={data.adresse}
              onChange={(e) => patch({ adresse: e.target.value })}
            />
          </Field>
          <Field label="Pièce d’identité">
            <ChoiceGrid name="pieceIdentiteType" options={PIECES} value={data.pieceIdentiteType} onChange={(v) => patch({ pieceIdentiteType: String(v) })} />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="N° pièce d’identité">
              <input className={inputClass} value={data.pieceIdentiteNumero} onChange={(e) => patch({ pieceIdentiteNumero: e.target.value })} />
            </Field>
            <Field label="Date de délivrance">
              <input
                type="date"
                className={inputClass}
                value={data.pieceIdentiteDelivrance ?? ""}
                onChange={(e) => patch({ pieceIdentiteDelivrance: e.target.value || null })}
              />
            </Field>
            <Field label="Date d’expiration">
              <input
                type="date"
                className={inputClass}
                value={data.pieceIdentiteExpiration ?? ""}
                onChange={(e) => patch({ pieceIdentiteExpiration: e.target.value || null })}
              />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Nationalité(s)">
              <input className={inputClass} value={data.nationalites} onChange={(e) => patch({ nationalites: e.target.value })} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputClass} value={data.email} onChange={(e) => patch({ email: e.target.value })} />
            </Field>
            <Field label="Téléphone (fixe / portable)">
              <input className={inputClass} value={data.telephone} onChange={(e) => patch({ telephone: e.target.value })} />
            </Field>
          </div>
          <Field label="Statut matrimonial">
            <ChoiceGrid name="statutMatrimonial" options={STATUTS_MATRIMONIAUX} value={data.statutMatrimonial} onChange={(v) => patch({ statutMatrimonial: String(v) })} />
          </Field>
          {data.statutMatrimonial === "AUTRE" ? (
            <Field label="Précision(s)">
              <input className={inputClass} value={data.statutMatrimonialPrecision} onChange={(e) => patch({ statutMatrimonialPrecision: e.target.value })} />
            </Field>
          ) : null}
          <Field label="Classification">
            <ChoiceGrid name="classification" options={CLASSIFICATIONS} value={data.classification} onChange={(v) => patch({ classification: String(v) })} />
          </Field>
          {data.classification === "AUTRES" ? (
            <Field label="Précision(s)">
              <input className={inputClass} value={data.classificationPrecision} onChange={(e) => patch({ classificationPrecision: e.target.value })} />
            </Field>
          ) : null}
        </div>
      ) : null}

      {section === 1 ? (
        <div className="space-y-5">
          <h3 className="font-display text-lg font-bold text-[#0B1B59]">Situation professionnelle</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Profession / Activité">
              <input className={inputClass} value={data.profession} onChange={(e) => patch({ profession: e.target.value })} />
            </Field>
            <Field label="Employeur">
              <input className={inputClass} value={data.employeur} onChange={(e) => patch({ employeur: e.target.value })} />
            </Field>
            <Field label="Secteur d’activité">
              <input className={inputClass} value={data.secteurActivite} onChange={(e) => patch({ secteurActivite: e.target.value })} />
            </Field>
            <Field label="Ancienneté dans cette entreprise">
              <input className={inputClass} value={data.ancienneteEntreprise} onChange={(e) => patch({ ancienneteEntreprise: e.target.value })} placeholder="Ex. 4 ans" />
            </Field>
          </div>
          <Field label="Adresse employeur">
            <input className={inputClass} value={data.adresseEmployeur} onChange={(e) => patch({ adresseEmployeur: e.target.value })} />
          </Field>
          <Field label="Si depuis moins de 3 ans, nom et adresse de l’employeur précédent">
            <textarea
              className={`${inputClass} h-20 py-2`}
              value={data.employeurPrecedent}
              onChange={(e) => patch({ employeurPrecedent: e.target.value })}
            />
          </Field>
          <div>
            <p className="text-[12px] font-semibold text-[#0B1B59]/70 mb-2">Personne(s) à contacter en cas d’urgence</p>
            <div className="space-y-3">
              {data.contactsUrgence.map((contact, index) => (
                <div key={index} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
                  <input className={inputClass} placeholder="Nom(s)" value={contact.nom} onChange={(e) => patchContact(index, { nom: e.target.value })} />
                  <input className={inputClass} placeholder="Prénom(s)" value={contact.prenoms} onChange={(e) => patchContact(index, { prenoms: e.target.value })} />
                  <input className={inputClass} placeholder="Téléphone" value={contact.telephone} onChange={(e) => patchContact(index, { telephone: e.target.value })} />
                  <button
                    type="button"
                    className="h-11 w-11 rounded-xl border border-[#0B1B59]/10 text-[#0B1B59]/50 hover:text-red-600"
                    onClick={() => patch({ contactsUrgence: data.contactsUrgence.filter((_, i) => i !== index) })}
                    disabled={data.contactsUrgence.length <= 1}
                  >
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1B59]"
              onClick={() => patch({ contactsUrgence: [...data.contactsUrgence, { nom: "", prenoms: "", telephone: "" }] })}
            >
              <Plus size={14} /> Ajouter un contact
            </button>
          </div>
          <Field label="En cas de décès du mandant, le capital et les intérêts seront remis">
            <ChoiceGrid name="decesDestination" options={DECES} value={data.decesDestination} onChange={(v) => patch({ decesDestination: String(v) })} />
          </Field>
          {data.decesDestination === "PERSONNE" ? (
            <Field label="À M. / Mme">
              <input className={inputClass} value={data.decesPersonneNom} onChange={(e) => patch({ decesPersonneNom: e.target.value })} />
            </Field>
          ) : null}
        </div>
      ) : null}

      {section === 2 ? (
        <div className="space-y-6">
          <h3 className="font-display text-lg font-bold text-[#0B1B59]">2. Profil de risque</h3>
          <Field label="Quel est votre revenu mensuel net ?">
            <ChoiceGrid name="revenuMensuel" options={REVENUS} value={data.revenuMensuel} onChange={(v) => patch({ revenuMensuel: String(v) })} />
          </Field>
          <Field label="Quel montant envisagez-vous investir ?">
            <ChoiceGrid name="montantInvestir" options={MONTANTS} value={data.montantInvestir} onChange={(v) => patch({ montantInvestir: String(v) })} />
          </Field>
          <Field label="Quelle est la provenance des fonds à investir ? (plusieurs choix possibles)">
            <ChoiceGrid name="provenanceFonds" multiple options={PROVENANCES} value={data.provenanceFonds} onChange={(v) => patch({ provenanceFonds: v as string[] })} />
          </Field>
          {data.provenanceFonds.includes("AUTRE") ? (
            <Field label="Précision(s)">
              <input className={inputClass} value={data.provenanceFondsPrecision} onChange={(e) => patch({ provenanceFondsPrecision: e.target.value })} />
            </Field>
          ) : null}
          <Field label="Quel est votre objectif principal d’investissement ?">
            <ChoiceGrid name="objectifInvestissement" options={OBJECTIFS} value={data.objectifInvestissement} onChange={(v) => patch({ objectifInvestissement: String(v) })} />
          </Field>
          <Field label="Comment voulez-vous communiquer avec nous ?">
            <ChoiceGrid name="communicationCanaux" multiple options={CANAUX} value={data.communicationCanaux} onChange={(v) => patch({ communicationCanaux: v as string[] })} />
          </Field>
          <Field label="Quel est votre niveau de compréhension des placements et de la bourse ?">
            <ChoiceGrid name="niveauComprehension" options={COMPREHENSIONS} value={data.niveauComprehension} onChange={(v) => patch({ niveauComprehension: String(v) })} />
          </Field>
          <Field label="Comment pourriez-vous qualifier votre situation financière actuelle ?">
            <ChoiceGrid name="situationFinanciere" options={SITUATIONS} value={data.situationFinanciere} onChange={(v) => patch({ situationFinanciere: String(v) })} />
          </Field>
          <Field label="À combien s’élèvent mes économies actuellement ?">
            <ChoiceGrid name="epargneActuelle" options={EPARGNES} value={data.epargneActuelle} onChange={(v) => patch({ epargneActuelle: String(v) })} />
          </Field>
          <Field label="Dans combien de temps auriez-vous besoin de vos fonds ?">
            <ChoiceGrid name="horizonFonds" options={HORIZONS} value={data.horizonFonds} onChange={(v) => patch({ horizonFonds: String(v) })} />
          </Field>
          <Field label="À quelle fréquence souhaitez-vous suivre l’évolution de vos placements ?">
            <ChoiceGrid name="frequenceSuivi" options={FREQUENCES} value={data.frequenceSuivi} onChange={(v) => patch({ frequenceSuivi: String(v) })} />
          </Field>
          <Field label="Quel type de placement détenez-vous actuellement ou avez-vous déjà détenus ?">
            <ChoiceGrid name="placementsDetenus" multiple options={PLACEMENTS} value={data.placementsDetenus} onChange={(v) => patch({ placementsDetenus: v as string[] })} />
          </Field>
          {data.placementsDetenus.includes("AUTRE") ? (
            <Field label="Précision(s)">
              <input className={inputClass} value={data.placementsPrecision} onChange={(e) => patch({ placementsPrecision: e.target.value })} />
            </Field>
          ) : null}
          <Field label="Quel est votre niveau de tolérance au risque ?">
            <ChoiceGrid name="toleranceRisque" options={TOLERANCES} value={data.toleranceRisque} onChange={(v) => patch({ toleranceRisque: String(v) })} />
          </Field>
          <Field label="Quelle baisse seriez-vous prêt à accepter temporairement sur vos placements ?">
            <ChoiceGrid name="baisseAcceptee" options={BAISSES} value={data.baisseAcceptee} onChange={(v) => patch({ baisseAcceptee: String(v) })} />
          </Field>
        </div>
      ) : null}

      {section === 3 ? (
        <div className="space-y-5">
          <h3 className="font-display text-lg font-bold text-[#0B1B59]">3. Pièces à joindre</h3>
          <p className="text-sm text-[#0B1B59]/60">
            PDF, JPG ou PNG — 15 Mo maximum. Vous pouvez les scanner ou photographier.
          </p>
          <div className="space-y-3">
            {DOCUMENT_KINDS.map((item) => {
              const file = application.documents.find((doc) => doc.kind === item.kind);
              return (
                <div key={item.kind} className="rounded-2xl border border-[#0B1B59]/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#0B1B59]">{item.title}</p>
                      <p className="text-[13px] text-[#0B1B59]/55 mt-1">{item.hint}</p>
                      {file ? (
                        <p className="mt-2 text-[13px] text-[#0B1B59]">
                          {file.originalFilename} · {(file.sizeBytes / 1024).toFixed(0)} Ko
                        </p>
                      ) : (
                        <p className="mt-2 text-[13px] text-[#0B1B59]/40">Aucun fichier</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {file ? (
                        <button
                          type="button"
                          className="h-10 px-3 rounded-full text-sm text-red-600"
                          onClick={() => onDeleteDocument(file.id)}
                        >
                          Retirer
                        </button>
                      ) : null}
                      <label className="h-10 px-4 rounded-full bg-[#0B1B59] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer">
                        {uploading === item.kind ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {file ? "Remplacer" : "Joindre"}
                        <input
                          type="file"
                          className="sr-only"
                          accept={
                            item.kind === "PHOTO_IDENTITE"
                              ? "image/jpeg,image/png,image/webp"
                              : "application/pdf,image/jpeg,image/png,image/webp"
                          }
                          onChange={async (e) => {
                            const selected = e.target.files?.[0];
                            e.target.value = "";
                            if (!selected) return;
                            setUploading(item.kind);
                            try {
                              await onUpload(item.kind, selected);
                            } finally {
                              setUploading(null);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          className="h-11 px-4 rounded-full text-sm font-semibold text-[#0B1B59]/70"
          disabled={section === 0}
          onClick={() => setSection((n) => Math.max(0, n - 1))}
        >
          Retour
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onSaveDraft()}
            disabled={saving}
            className="h-11 px-5 rounded-full border border-[#0B1B59]/15 text-sm font-semibold text-[#0B1B59]"
          >
            {saving ? "Enregistrement…" : "Enregistrer le brouillon"}
          </button>
          {section < SECTIONS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                void onSaveDraft();
                setSection((n) => n + 1);
              }}
              className="h-11 px-5 rounded-full bg-[#F5D251] text-[#0B1B59] text-sm font-bold"
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void onComplete()}
              disabled={saving}
              className="h-11 px-5 rounded-full bg-[#F5D251] text-[#0B1B59] text-sm font-bold inline-flex items-center gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              Valider et continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
