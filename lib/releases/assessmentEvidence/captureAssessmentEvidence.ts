import type { CompanyAssessmentSnapshot } from "../assessmentTypes";
import { getAssessmentEvidenceChoices } from "./getAssessmentEvidenceChoices";
import { selectedBriefEvidenceSchema } from "./vendor/selectedBriefEvidenceSchema";

/** Detached explicit origin and exact manifest rows; no identity inference or dispatch. */
export function captureAssessmentEvidence(
  snapshot: CompanyAssessmentSnapshot,
  selectedIds: string[],
) {
  const choices = getAssessmentEvidenceChoices(snapshot);
  if (!choices) return null;
  const selected = selectedIds.map((id) =>
    choices.find((row) => row.documentId === id),
  );
  const parsed = selectedBriefEvidenceSchema.safeParse(selected);
  return parsed.success
    ? { brief_id: snapshot.id, selected_evidence: parsed.data }
    : null;
}
