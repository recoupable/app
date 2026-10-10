export interface CompanyAssessmentBrief {
  purpose: "company_onboarding";
  text: string;
  readiness: string;
  missingTopics: string[];
  guidance: string;
}
export interface CompanyAssessmentSnapshot {
  id: string;
  state: "saved" | "unavailable";
  superseded?: boolean;
  brief: CompanyAssessmentBrief | null;
}
