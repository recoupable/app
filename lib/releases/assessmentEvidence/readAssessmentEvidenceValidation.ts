import { z } from "zod/v4";
import { briefEvidenceValidationSchema } from "./vendor/selectedBriefEvidenceSchema";
import type { captureAssessmentEvidence } from "./captureAssessmentEvidence";

/** Read-only authority is accepted only for the exact captured selection. */
export function readAssessmentEvidenceValidation(
  response: unknown,
  captured: NonNullable<ReturnType<typeof captureAssessmentEvidence>>,
) {
  const result = z
    .object({
      snapshot: z.object({
        id: z.uuid(),
        state: z.enum(["saved", "unavailable"]),
        superseded: z.boolean(),
      }),
      evidence_validation: briefEvidenceValidationSchema,
    })
    .parse(response);
  if (result.snapshot.id !== captured.brief_id)
    throw new Error("Snapshot mismatch");
  const validation = result.evidence_validation;
  if (validation.state === "unavailable") return validation;
  if (
    result.snapshot.state !== "saved" ||
    result.snapshot.superseded ||
    validation.documents.length !== captured.selected_evidence.length
  )
    throw new Error("Selection mismatch");
  validation.documents.forEach((document, index) => {
    const selected = captured.selected_evidence[index];
    if (
      document.documentId !== selected.documentId ||
      document.subjectId !== selected.subjectId ||
      document.sourceVersionIds.length !== selected.sourceVersionIds.length ||
      document.sourceVersionIds.some(
        (id) => !selected.sourceVersionIds.includes(id),
      )
    )
      throw new Error("Evidence mismatch");
  });
  return validation;
}
