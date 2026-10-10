export interface CompanyAssessmentBrief {
  purpose: "company_onboarding";
  text: string;
  readiness: string;
  missingTopics: string[];
  guidance: string;
}
export type CompanyAssessmentSnapshot = {
  id: string;
  superseded?: boolean;
} & (
  | { state: "saved"; brief: CompanyAssessmentBrief }
  | { state: "unavailable"; brief: null }
);
