import type { AuditAssessment, AuditSnapshot, AuditSource } from "./schemas";

/** A newer usable case may have dropped withdrawn evidence instead of redacting it. */
export function canRestoreAuditNote(
  previous: AuditSnapshot,
  current: AuditSnapshot,
  noteId: string,
) {
  const note = previous.assessments[noteId] as AuditAssessment | undefined;
  const original = previous.assessments["assessment:context"];
  const retained = current.assessments["assessment:context"];
  if (
    !note ||
    note.withheld === true ||
    !original ||
    !retained ||
    original.withheld === true ||
    retained.withheld === true ||
    retained.stale ||
    JSON.stringify(original) !== JSON.stringify(retained)
  )
    return false;
  return note.source_refs.every((ref) => {
    const before = previous.sources[ref.source_id] as AuditSource | undefined;
    const after = current.sources[ref.source_id] as AuditSource | undefined;
    return (
      before &&
      after &&
      before.withheld !== true &&
      after.withheld !== true &&
      before.status === "active" &&
      after.status === "active" &&
      before.version === ref.version &&
      after.version === ref.version &&
      before.sha256 === after.sha256 &&
      before.context_source_version_id === after.context_source_version_id
    );
  });
}
