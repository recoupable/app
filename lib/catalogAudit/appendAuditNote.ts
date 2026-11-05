import type { AuditAssessment, AuditSnapshot } from "./schemas";

/** The note inherits all evidence dependencies so withdrawal also withholds the note. */
export function appendAuditNote(
  snapshot: AuditSnapshot,
  note: string,
): AuditSnapshot {
  const initial = snapshot.assessments["assessment:context"];
  if (
    !initial ||
    initial.withheld === true ||
    !note.trim() ||
    note.length > 16000
  )
    throw new Error("This audit cannot be continued");
  const next = structuredClone(snapshot);
  const id = `assessment:note:${crypto.randomUUID()}`;
  const assessment: AuditAssessment = {
    id,
    stage: "audit",
    status: "partial",
    summary: note.trim(),
    rule_version: "context-catalog-audit-note-v1",
    depends_on: [initial.id],
    source_refs: Object.values(snapshot.sources).map((entry) => {
      if (
        entry.withheld === true ||
        entry.status !== "active" ||
        !entry.version
      )
        throw new Error("Evidence is no longer available");
      return { source_id: entry.id, version: entry.version };
    }),
  };
  if (!assessment.source_refs.length)
    assessment.evidence_gap = "No source evidence retained.";
  next.assessments[id] = assessment;
  return next;
}
