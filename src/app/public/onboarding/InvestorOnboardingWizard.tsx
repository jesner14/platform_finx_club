import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ApiError } from "../../api";
import { ONBOARDING_STEPS } from "./constants";
import { AccountConventionForm } from "./AccountConventionForm";
import { AccountOpeningForm } from "./AccountOpeningForm";
import { CommunicationPreferenceForm } from "./CommunicationPreferenceForm";
import { MandateAgreementForm } from "./MandateAgreementForm";
import { QuestionnaireForm } from "./QuestionnaireForm";
import { SignatureCardForm } from "./SignatureCardForm";
import {
  completeAccountConvention,
  completeAccountOpening,
  completeCommunicationPreference,
  completeMandateAgreement,
  completeQuestionnaire,
  completeSignature,
  createOrResumeMyInvestorApplication,
  deleteDocument,
  saveQuestionnaire,
  uploadDocument,
} from "./api";
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
} from "./types";

export function InvestorOnboardingWizard({
  onClose,
  onCompleted,
}: {
  onClose?: () => void;
  onCompleted?: () => void;
}) {
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
        const dossier = await createOrResumeMyInvestorApplication();
        if (cancelled) return;
        apply(dossier);
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
    if (next.status === "COMPLETED") onCompleted?.();
  };

  const currentStep = application?.currentStep ?? 1;

  const run = async (action: () => Promise<InvestorApplication>) => {
    setSaving(true);
    setError(null);
    try {
      apply(await action());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const persistDraft = () => {
    if (!application) return Promise.resolve();
    return run(() => saveQuestionnaire(application.id, data));
  };

  const persistUpload = (kind: DocumentKind, file: File) => {
    if (!application) return Promise.resolve();
    return run(() => uploadDocument(application.id, kind, file));
  };

  const persistDelete = (documentId: number) => {
    if (!application) return Promise.resolve();
    return run(() => deleteDocument(application.id, documentId));
  };

  const submitQuestionnaire = () => {
    if (!application) return;
    void run(() => completeQuestionnaire(application.id, data));
  };

  const submitSignature = () => {
    if (!application || !signatureDataUrl) {
      setError("Ajoutez votre spécimen de signature.");
      return;
    }
    void run(() => completeSignature(application.id, signatureDataUrl));
  };

  const submitOpening = () => {
    if (!application) return;
    void run(() => completeAccountOpening(application.id, opening));
  };

  const submitConvention = () => {
    if (!application) return;
    void run(() => completeAccountConvention(application.id, convention));
  };

  const submitMandate = () => {
    if (!application) return;
    void run(() => completeMandateAgreement(application.id, mandate));
  };

  const submitPreference = () => {
    if (!application) return;
    void run(async () => {
      const next = await completeCommunicationPreference(application.id, preference);
      onCompleted?.();
      return next;
    });
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

  const current = Math.min(Math.max(currentStep, 1), ONBOARDING_STEPS.length);
  const total = ONBOARDING_STEPS.length;
  const done = application?.status === "COMPLETED";
  const pct = done ? 100 : Math.round(((current - 1) / total) * 100);
  const step = ONBOARDING_STEPS[current - 1];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">Devenir membre investisseur</p>
          <h2 className="font-display text-xl font-bold text-foreground mt-1">Dossier d’ouverture de compte</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Six étapes pour finaliser votre candidature investisseur. Après transmission, un administrateur validera
            votre dossier.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Fermer
          </button>
        )}
      </div>

      <div className="max-w-2xl">
        <div className="flex items-end justify-between gap-3 mb-2">
          <p className="text-[13px] text-foreground/80">
            <span className="font-semibold text-primary">
              Étape {current}/{total}
            </span>
            <span className="text-muted-foreground"> · </span>
            <span>
              {step.code} — {step.title}
            </span>
          </p>
          <p className="text-[12px] font-semibold text-muted-foreground">{pct}%</p>
        </div>
        <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${Math.max(pct, current === 1 ? 8 : pct)}%` }} />
        </div>
      </div>

      <section className="rounded-[1.4rem] bg-[#F4F6FA] overflow-hidden border border-border" style={{ colorScheme: "light" }}>
        <div className="h-1.5 bg-[#0B1B59]" />
        <div className="px-5 sm:px-8 py-7">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#01AAE4] font-bold">{stepMeta.code}</p>
          <h3 className="mt-1 font-display text-xl font-bold text-[#0B1B59]">{stepMeta.title}</h3>

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
              <p className="mt-3 text-sm text-[#0B1B59]/65 max-w-md mx-auto">
                Votre dossier investisseur a été transmis à FINX Club. Un administrateur le validera prochainement.
              </p>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 h-11 px-5 rounded-full bg-[#0B1B59] text-white text-sm font-bold"
                >
                  Retour à mon espace
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
