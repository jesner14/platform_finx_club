import { api } from "../../api";
import {
  APPLICATION_KEY,
  type AccountConvention,
  type AccountOpening,
  type CommunicationPreference,
  type DocumentKind,
  type InvestorApplication,
  type MandateAgreement,
  type Questionnaire,
} from "./types";

export function rememberApplication(id: string) {
  localStorage.setItem(APPLICATION_KEY, id);
}

export function rememberedApplicationId() {
  return localStorage.getItem(APPLICATION_KEY);
}

export function createApplication() {
  return api<InvestorApplication>("/api/public/investor-applications", { method: "POST" });
}

export function loadApplication(id: string) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}`);
}

export function saveQuestionnaire(id: string, questionnaire: Questionnaire) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/questionnaire`, {
    method: "PUT",
    body: JSON.stringify(questionnaire),
  });
}

export function completeQuestionnaire(id: string, questionnaire: Questionnaire) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/questionnaire/complete`, {
    method: "POST",
    body: JSON.stringify(questionnaire),
  });
}

export function uploadDocument(id: string, kind: DocumentKind, file: File) {
  const body = new FormData();
  body.append("kind", kind);
  body.append("file", file);
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/documents`, {
    method: "POST",
    body,
  });
}

export function deleteDocument(id: string, documentId: number) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/documents/${documentId}`, {
    method: "DELETE",
  });
}

export function questionnaireExportUrl(id: string) {
  return `/api/public/investor-applications/${id}/exports/questionnaire`;
}

export function signatureCardExportUrl(id: string) {
  return `/api/public/investor-applications/${id}/exports/carton-signature`;
}

export function accountOpeningExportUrl(id: string) {
  return `/api/public/investor-applications/${id}/exports/demande-ouverture`;
}

export function accountConventionExportUrl(id: string) {
  return `/api/public/investor-applications/${id}/exports/convention-ouverture`;
}

export function mandateAgreementExportUrl(id: string) {
  return `/api/public/investor-applications/${id}/exports/gestion-mandat`;
}

export function communicationPreferenceExportUrl(id: string) {
  return `/api/public/investor-applications/${id}/exports/preference-communication`;
}

export function documentContentUrl(id: string, documentId: number) {
  return `/api/public/investor-applications/${id}/documents/${documentId}/content`;
}

export function completeSignature(id: string, signaturePngBase64: string) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/signature/complete`, {
    method: "POST",
    body: JSON.stringify({ signaturePngBase64 }),
  });
}

export function saveAccountOpening(id: string, payload: AccountOpening) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/account-opening`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function completeAccountOpening(id: string, payload: AccountOpening) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/account-opening/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveAccountConvention(id: string, payload: AccountConvention) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/account-convention`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function completeAccountConvention(id: string, payload: AccountConvention) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/account-convention/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveMandateAgreement(id: string, payload: MandateAgreement) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/mandate-agreement`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function completeMandateAgreement(id: string, payload: MandateAgreement) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/mandate-agreement/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveCommunicationPreference(id: string, payload: CommunicationPreference) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/communication-preference`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function completeCommunicationPreference(id: string, payload: CommunicationPreference) {
  return api<InvestorApplication>(`/api/public/investor-applications/${id}/communication-preference/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
