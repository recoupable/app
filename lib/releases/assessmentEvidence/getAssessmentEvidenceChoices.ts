import { z } from "zod/v4";
import type { CompanyAssessmentSnapshot } from "../assessmentTypes";
import { selectedBriefEvidenceSchema } from "./vendor/selectedBriefEvidenceSchema";

/** Local eligibility only; the server must separately authorize any future use. */
export function getAssessmentEvidenceChoices(
  snapshot: CompanyAssessmentSnapshot | null,
) {
  if (
    !snapshot ||
    snapshot.state !== "saved" ||
    snapshot.superseded !== false ||
    snapshot.brief?.purpose !== "company_onboarding" ||
    !z.uuid().safeParse(snapshot.id).success
  )
    return null;
  const rows = snapshot.brief.input_manifest?.documents;
  if (!Array.isArray(rows) || !rows.length) return null;
  const documents: z.infer<typeof selectedBriefEvidenceSchema> = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") return null;
    const parsed = selectedBriefEvidenceSchema.safeParse([
      {
        documentId: row.documentId,
        resultId: row.resultId,
        subjectId: row.subjectId,
        topic: row.topic,
        version: row.version,
        sourceVersionIds: row.sourceVersionIds,
      },
    ]);
    if (
      !parsed.success ||
      documents.some((item) => item.documentId === parsed.data[0].documentId)
    )
      return null;
    documents.push(parsed.data[0]);
  }
  return documents;
}
