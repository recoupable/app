import type { AuditAssessment, AuditSnapshot } from "./schemas";

/** Portable cases from other workflows remain readable, not editable in this bounded UI. */
export function canContinueAudit(snapshot: AuditSnapshot) {
  const initial = snapshot.assessments["assessment:context"] as
    | AuditAssessment
    | undefined;
  return Boolean(
    initial &&
      initial.withheld !== true &&
      !initial.stale &&
      initial.stage === "audit" &&
      initial.rule_version === "context-catalog-audit-v1" &&
      Object.values(snapshot.sources).every(
        (source) => source.withheld !== true && source.status === "active",
      ),
  );
}
