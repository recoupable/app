import {
  collections,
  type AuditSnapshot,
  type AuditAssessment,
} from "./schemas";

export function validateSnapshot(snapshot: AuditSnapshot, workspaceId: string) {
  if (snapshot.workspace_id.toLowerCase() !== workspaceId.toLowerCase())
    throw new Error("Unexpected workspace");
  const ids = new Set<string>();
  for (const name of collections)
    for (const [key, entry] of Object.entries(snapshot[name])) {
      if (entry.id !== key || ids.has(key))
        throw new Error("Invalid audit record");
      ids.add(key);
      if (entry.withheld === true) continue;
      if (name !== "sources") {
        const record = entry as AuditAssessment;
        if (!record.source_refs.length && !record.evidence_gap)
          throw new Error("Missing evidence gap");
        for (const ref of record.source_refs) {
          const evidence = Object.prototype.hasOwnProperty.call(
            snapshot.sources,
            ref.source_id,
          )
            ? snapshot.sources[ref.source_id]
            : undefined;
          if (
            !evidence ||
            (!record.stale &&
              (evidence.withheld === true ||
                evidence.status !== "active" ||
                evidence.version !== ref.version))
          )
            throw new Error("Invalid evidence reference");
        }
      }
    }
}
