import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ApiError } from "../api";
import { ModeToggle } from "../theme/ThemeContext";
import { goPublic } from "./publicNav";
import { ONBOARDING_STEPS } from "./onboarding/constants";
import { AccountConventionForm } from "./onboarding/AccountConventionForm";
import { AccountOpeningForm } from "./onboarding/AccountOpeningForm";
import { CommunicationPreferenceForm } from "./onboarding/CommunicationPreferenceForm";
import { MandateAgreementForm } from "./onboarding/MandateAgreementForm";
import { QuestionnaireForm } from "./onboarding/QuestionnaireForm";
import { SignatureCardForm } from "./onboarding/SignatureCardForm";
import {
  completeAccountConvention,
  completeAccountOpening,
  completeCommunicationPreference,
  completeMandateAgreement,
  completeQuestionnaire,
  completeSignature,
  createApplication,
  deleteDocument,
  loadApplication,
  rememberApplication,
  rememberedApplicationId,
  saveQuestionnaire,
  uploadDocument,
} from "./onboarding/api";
import {
  emptyAccountConvention,
  emptyAccountOpening,
  emptyCommunicationPreference,
  emptyMandateAgreement,
  emptyQuestionnaire,
  mergeAccountConvention,
  mergeAccountOpening,
  mergeCommunicationPreference,
  mergeMandateAgreement,
  mergeQuestionnaire,
  type AccountConvention,
  type AccountOpening,
  type CommunicationPreference,
  type DocumentKind,
  type InvestorApplication,
  type MandateAgreement,
  type Questionnaire,
} from "./onboarding/types";

export function RegisterPage() {
  const [application, setApplication] = useState<InvestorApplication | null>(null);
  const [data, setData] = useState<Questionnaire>(emptyQuestionnaire());
  const [opening, setOpening] = useState<AccountOpening>(emptyAccountOpening());
  const [convention, setConvention] = useState<AccountConvention>(emptyAccountConvention());
  const [mandate, setMandate] = useState<MandateAgreement>(emptyMandateAgreement());
  const [preference, setPreference] = useState<CommunicationPreference>(emptyCommunicationPreference());
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = rememberedApplicationId();
        const dossier = existing ? await loadApplication(existing).catch(() => createApplication()) : await createApplication();
        if (cancelled) return;
        rememberApplication(dossier.id);
        setApplication(dossier);
        setData(mergeQuestionnaire(dossier.questionnaire));
        setOpening(mergeAccountOpening(dossier.accountOpening));
        setConvention(mergeAccountConvention(dossier.accountConvention));
        setMandate(mergeMandateAgreement(dossier.mandateAgreement, dossier.questionnaire?.horizonFonds));
        setPreference(
          mergeCommunicationPreference(dossier.communicationPreference, dossier.questionnaire?.communicationCanaux),
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Impossible d’ouvrir le dossier.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const apply = (next: InvestorApplication) => {
    setApplication(next);
    setData(mergeQuestionnaire(next.questionnaire));
    setOpening(mergeAccountOpening(next.accountOpening));
    setConvention(mergeAccountConvention(next.accountConvention));
    setMandate(mergeMandateAgreement(next.mandateAgreement, next.questionnaire?.horizonFonds));
    setPreference(
      mergeCommunicationPreference(next.communicationPreference, next.questionnaire?.communicationCanaux),
    );
    rememberApplication(next.id);
  };

  const currentStep = application?.currentStep ?? 1;

  const persistDraft = async () => {
    if (!application) return;
    setSaving(true);
    setError(null);
    try {
      apply(await saveQuestionnaire(application.id, data));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const submitQuestionnaire = async () => {
    if (!application) return;
    setSaving(true);
    setError(null);
    try {
      apply(await completeQuestionnaire(application.id, data));
      setSignatureDataUrl(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Validation impossible.");
    } finally {
      setSaving(false);
    }
  };

  const submitSignature = async () => {
    if (!application || !signatureDataUrl) {
      setError("Signez dans le cadre avant de continuer.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await completeSignature(application.id, signatureDataUrl);
      apply(next);
      setSignatureDataUrl(null);
      setOpening(
        mergeAccountOpening({
          ...next.accountOpening,
          faitA: next.accountOpening?.faitA || "Dakar",
          faitLe: next.accountOpening?.faitLe || new Date().toISOString().slice(0, 10),
        }),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Validation impossible.");
    } finally {
      setSaving(false);
    }
  };

  const submitOpening = async () => {
    if (!application) return;
    if (!opening.attestationExactitude) {
      setError("Cochez l’attestation d’exactitude.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await completeAccountOpening(application.id, opening);
      apply(next);
      setConvention(
        mergeAccountConvention({
          ...next.accountConvention,
          faitA: next.accountConvention?.faitA || opening.faitA || "Dakar",
          faitLe: next.accountConvention?.faitLe || opening.faitLe,
        }),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Validation impossible.");
    } finally {
      setSaving(false);
    }
  };

  const submitConvention = async () => {
    if (!application) return;
    if (!convention.accepteConvention || !convention.accepteTarifs) {
      setError("Acceptez la convention et la grille tarifaire.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await completeAccountConvention(application.id, convention);
      apply(next);
      setMandate(
        mergeMandateAgreement(
          {
            ...next.mandateAgreement,
            faitA: next.mandateAgreement?.faitA || convention.faitA || "Dakar",
            faitLe: next.mandateAgreement?.faitLe || convention.faitLe,
          },
          next.questionnaire?.horizonFonds,
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Validation impossible.");
    } finally {
      setSaving(false);
    }
  };

  const submitMandate = async () => {
    if (!application) return;
    if (!mandate.accepteMandat || !mandate.accepteTarifs) {
      setError("Acceptez le mandat et la grille tarifaire.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await completeMandateAgreement(application.id, mandate);
      apply(next);
      setPreference(
        mergeCommunicationPreference(
          {
            ...next.communicationPreference,
            faitA: next.communicationPreference?.faitA || mandate.faitA || "Dakar",
            faitLe: next.communicationPreference?.faitLe || mandate.faitLe,
          },
          next.questionnaire?.communicationCanaux,
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Validation impossible.");
    } finally {
      setSaving(false);
    }
  };

  const submitPreference = async () => {
    if (!application) return;
    if (!preference.modes.length) {
      setError("Choisissez au moins un mode de communication.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      apply(await completeCommunicationPreference(application.id, preference));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Validation impossible.");
    } finally {
      setSaving(false);
    }
  };

  const persistUpload = async (kind: DocumentKind, file: File) => {
    if (!application) return;
    if (
      kind === "QUESTIONNAIRE_EXPORTE" ||
      kind === "CARTON_SIGNATURE_EXPORTE" ||
      kind === "SIGNATURE_SPECIMEN" ||
      kind === "DEMANDE_OUVERTURE_EXPORTE" ||
      kind === "CONVENTION_OUVERTURE_EXPORTE" ||
      kind === "GESTION_MANDAT_EXPORTE" ||
      kind === "PREFERENCE_COMM_EXPORTE"
    ) {
      return;
    }
    setError(null);
    try {
      apply(await uploadDocument(application.id, kind, file));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Téléversement impossible.");
    }
  };

  const persistDelete = async (documentId: number) => {
    if (!application) return;
    setError(null);
    try {
      apply(await deleteDocument(application.id, documentId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Suppression impossible.");
    }
  };

  const stepMeta =
    currentStep === 1
      ? { code: "001 · Questionnaire PP · CI", title: "Fiche d’identification et de connaissance du client" }
      : currentStep === 2
        ? { code: "002 · Carton de signature PP · CI", title: "Carton de signature" }
        : currentStep === 3
          ? { code: "003 · Demande d’ouverture PP · CI", title: "Demande d’ouverture de compte" }
          : currentStep === 4
            ? { code: "004 · Convention d’ouverture PP · CI", title: "Convention d’ouverture de compte" }
            : currentStep === 5
              ? { code: "005 · Gestion sous mandat PP · CI", title: "Convention de gestion sous mandat" }
              : currentStep === 6 && application?.status !== "COMPLETED"
                ? { code: "006 · Préférence de communication PP · CI", title: "Préférence de communication" }
                : { code: "006 · Dossier complet", title: "Parcours terminé" };

  return (
    <div
      className="min-h-screen relative flex flex-col font-sans"
      style={{
        fontFamily: "'Arimo', system-ui, sans-serif",
        background: "linear-gradient(160deg, #0B1B59 0%, #13266B 42%, #070F33 100%)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[#F5D251]" />
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-10 h-16">
        <button type="button" onClick={() => goPublic("home")} className="flex items-center gap-3">
          <img src="/symbol-finx.png" alt="" className="w-9 h-9 rounded-xl object-cover" />
          <img src="/logo-finx-white.png" alt="FINX CLUB" className="h-7 w-auto object-contain" />
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goPublic("login")}
            className="px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider text-white/80 hover:text-white"
          >
            Connexion
          </button>
          <ModeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
        <button
          type="button"
          onClick={() => goPublic("home")}
          className="mb-5 inline-flex items-center gap-2 text-xs text-[#F5D251] hover:underline"
        >
          <ArrowLeft size={14} /> Retour au site
        </button>

        <p className="font-mono text-[10px] tracking-[0.28em] text-[#01AAE4] uppercase mb-2">Ouverture de compte</p>
        <h1 className="font-display text-3xl font-bold text-white">Créer un compte investisseur</h1>
        <p className="mt-2 text-sm text-white/55 max-w-2xl">
          Personne physique · Compte individuel · Gestion sous mandat. Six étapes, toutes enregistrées. Les documents
          du dossier seront disponibles côté FINX après validation.
        </p>

        {(() => {
          const current = Math.min(Math.max(currentStep, 1), ONBOARDING_STEPS.length);
          const total = ONBOARDING_STEPS.length;
          const done = application?.status === "COMPLETED";
          const pct = done ? 100 : Math.round(((current - 1) / total) * 100);
          const step = ONBOARDING_STEPS[current - 1];
          return (
            <div className="mt-6 max-w-2xl">
              <div className="flex items-end justify-between gap-3 mb-2">
                <p className="text-[13px] text-white/80">
                  <span className="font-semibold text-[#F5D251]">
                    Étape {current}/{total}
                  </span>
                  <span className="text-white/45"> · </span>
                  <span>
                    {step.code} — {step.title}
                  </span>
                </p>
                <p className="text-[12px] font-semibold text-white/50">{pct}%</p>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#F5D251] transition-[width] duration-300"
                  style={{ width: `${Math.max(pct, current === 1 ? 8 : pct)}%` }}
                />
              </div>
            </div>
          );
        })()}

        <section
          className="mt-6 rounded-[1.6rem] bg-[#F4F6FA] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
          style={{ colorScheme: "light" }}
        >
          <div className="h-1.5 bg-[#F5D251]" />
          <div className="px-5 sm:px-8 py-7">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#01AAE4] font-bold">{stepMeta.code}</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-[#0B1B59]">{stepMeta.title}</h2>
            <p className="mt-2 text-[13px] text-[#0B1B59]/55">
              FINX SAS · 1, Liberté 6 Extension, Dakar · RC SN DKR 2024 B 23429 · NINEA 011288794
            </p>

            {loading ? (
              <div className="py-16 flex justify-center text-[#0B1B59]/50">
                <Loader2 className="animate-spin" />
              </div>
            ) : !application ? (
              <p className="mt-8 text-sm text-red-600">{error ?? "Dossier indisponible."}</p>
            ) : currentStep === 1 ? (
              <div className="mt-6">
                <QuestionnaireForm
                  application={application}
                  data={data}
                  onChange={setData}
                  onSaveDraft={persistDraft}
                  onUpload={persistUpload}
                  onDeleteDocument={persistDelete}
                  onComplete={submitQuestionnaire}
                  saving={saving}
                  error={error}
                />
              </div>
            ) : currentStep === 2 ? (
              <div className="mt-6">
                <SignatureCardForm
                  application={application}
                  data={data}
                  signatureDataUrl={signatureDataUrl}
                  onSignatureChange={setSignatureDataUrl}
                  saving={saving}
                  error={error}
                  onContinue={() => void submitSignature()}
                />
              </div>
            ) : currentStep === 3 ? (
              <div className="mt-6">
                <AccountOpeningForm
                  data={data}
                  opening={opening}
                  onChange={setOpening}
                  saving={saving}
                  error={error}
                  onContinue={() => void submitOpening()}
                />
              </div>
            ) : currentStep === 4 ? (
              <div className="mt-6">
                <AccountConventionForm
                  data={data}
                  convention={convention}
                  onChange={setConvention}
                  saving={saving}
                  error={error}
                  onContinue={() => void submitConvention()}
                />
              </div>
            ) : currentStep === 5 ? (
              <div className="mt-6">
                <MandateAgreementForm
                  data={data}
                  mandate={mandate}
                  onChange={setMandate}
                  saving={saving}
                  error={error}
                  onContinue={() => void submitMandate()}
                />
              </div>
            ) : currentStep === 6 && application.status !== "COMPLETED" ? (
              <div className="mt-6">
                <CommunicationPreferenceForm
                  data={data}
                  preference={preference}
                  onChange={setPreference}
                  saving={saving}
                  error={error}
                  onContinue={() => void submitPreference()}
                />
              </div>
            ) : (
              <div className="mt-8 rounded-2xl bg-white border border-[#0B1B59]/8 px-6 py-10 text-center">
                <p className="font-display text-2xl font-bold text-[#0B1B59]">Dossier transmis</p>
                <p className="mt-3 text-sm text-[#0B1B59]/60 max-w-md mx-auto">
                  Votre candidature a bien été enregistrée. Les six documents ont été générés et seront consultables
                  par FINX CLUB dans votre dossier membre. Vous ne pourrez pas vous connecter tant que votre dossier
                  n’aura pas été validé.
                </p>
                <button
                  type="button"
                  onClick={() => goPublic("home")}
                  className="mt-8 h-11 px-6 rounded-full bg-[#0B1B59] text-white text-sm font-semibold"
                >
                  Retour au site
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
