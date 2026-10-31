import type { z } from "zod/v4";
import type { briefEvidenceValidationSchema } from "./vendor/selectedBriefEvidenceSchema";
type Unavailable = Extract<
  z.infer<typeof briefEvidenceValidationSchema>,
  { state: "unavailable" }
>;
const messages = {
  saved_assessment_unavailable:
    "The saved assessment could not be used for this check.",
  selection_mismatch:
    "The captured selection could not be matched to the saved assessment.",
  current_evidence_unavailable:
    "The selected evidence could not be matched to current evidence.",
  identity_unconfirmed:
    "The selected evidence identity could not be confirmed.",
  validation_limit_exceeded:
    "The evidence could not be checked within the validation limits.",
} satisfies Record<NonNullable<Unavailable["reason"]>, string>;

/** Coarse explanations of this check, not diagnoses or permission to act. */
export function getEvidenceUnavailableMessage(result: Unavailable) {
  return result.reason
    ? messages[result.reason]
    : "Captured evidence is unavailable. Review the saved assessment and select again.";
}
