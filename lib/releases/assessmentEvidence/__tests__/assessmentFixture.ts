import type { CompanyAssessmentSnapshot } from "../../assessmentTypes";
export const id = (value: number) =>
  `00000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
export const snapshot: CompanyAssessmentSnapshot = {
  id: id(1),
  state: "saved",
  superseded: false,
  brief: {
    purpose: "company_onboarding",
    text: "Synthetic evidence summary",
    readiness: "partial",
    missingTopics: [],
    guidance: "Unverified assertions.",
    input_manifest: {
      compilerVersion: "context-brief-v1",
      method: "saved_evidence_selection",
      requestIds: [id(2)],
      excludedTopics: [],
      documents: Array.from({ length: 9 }, (_, i) => ({
        documentId: id(10 + i),
        resultId: i ? id(30 + i) : null,
        subjectId: id(50 + i),
        topic: "supporting_text",
        version: i + 1,
        sourceVersionIds: [id(70 + i)],
      })),
    },
  },
};
