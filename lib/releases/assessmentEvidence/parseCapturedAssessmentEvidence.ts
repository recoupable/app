import { z } from "zod/v4";
import { selectedBriefEvidenceSchema } from "./vendor/selectedBriefEvidenceSchema";

/** Parse the existing capture output only; this never grants evidence access. */
export function parseCapturedAssessmentEvidence(text: string) {
  if (text.length > 65536) return null;
  try {
    const result = z
      .strictObject({
        brief_id: z.uuid(),
        selected_evidence: selectedBriefEvidenceSchema,
      })
      .safeParse(JSON.parse(text));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
