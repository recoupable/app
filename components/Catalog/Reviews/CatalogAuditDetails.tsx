import AssessmentEvidenceReferences from "@/components/Releases/AssessmentEvidenceReferences";
import { assessmentManifestSchema } from "@/lib/catalogAudit/assessmentManifestSchema";
import type {
  AuditAssessment,
  AuditSnapshot,
  AuditSource,
} from "@/lib/catalogAudit/schemas";

export default function CatalogAuditDetails({
  snapshot,
  saved,
}: {
  snapshot: AuditSnapshot;
  saved: boolean;
}) {
  const assessments = Object.values(snapshot.assessments).filter(
    (record) => record.withheld !== true,
  ) as AuditAssessment[];
  const sources = Object.values(snapshot.sources).filter(
    (record) => record.withheld !== true,
  ) as AuditSource[];
  const initial = assessments.find(
    (record) => record.id === "assessment:context",
  );
  const manifest = assessmentManifestSchema.safeParse(
    initial?.data?.input_manifest,
  );
  const missing = Array.isArray(initial?.data?.missing_topics)
    ? initial.data.missing_topics.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-medium">
          {saved ? "Saved audit" : "Review your audit"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Partial coverage ·{" "}
          {saved ? `Saved revision ${snapshot.revision}` : "Not saved yet"}
        </p>
      </div>
      <p className="rounded-xl bg-muted/50 p-4 text-sm leading-relaxed">
        This review carries forward your selected assessment and its evidence.
        It does not verify ownership, complete registrations, contact providers
        or confirm payments.
      </p>
      {assessments.map((assessment) => (
        <section key={assessment.id} className="space-y-2">
          <h3 className="font-medium">
            {assessment.id === "assessment:context"
              ? "Assessment summary"
              : "Review note"}
          </h3>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {assessment.summary ?? "Summary unavailable."}
          </p>
          {assessment.evidence_gap && (
            <p className="text-sm text-muted-foreground">
              {assessment.evidence_gap}
            </p>
          )}
        </section>
      ))}
      {!initial && (
        <p className="text-sm">
          The original assessment is unavailable. Its protected summary and
          dependent notes are not displayed.
        </p>
      )}
      <section className="space-y-2">
        <h3 className="font-medium">Evidence still needed</h3>
        {missing.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {missing.map((topic, index) => (
              <li key={`${topic}-${index}`}>{topic.replaceAll("_", " ")}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No additional topic list is available. This partial review is not a
            complete catalog diligence assessment.
          </p>
        )}
      </section>
      <details className="rounded-xl bg-muted/30 p-4 text-sm">
        <summary className="cursor-pointer font-medium">
          Retained evidence and citations ({sources.length})
        </summary>
        <p className="mt-3 text-xs text-muted-foreground">
          These are the saved evidence versions used by this assessment, not
          newly collected or independently verified facts.
        </p>
        <ul className="mt-4 space-y-4">
          {sources.map((source) => (
            <li key={source.id} className="min-w-0 space-y-2">
              {source.summary && (
                <p className="whitespace-pre-wrap break-words">
                  {source.summary}
                </p>
              )}
              <dl className="grid gap-1 text-xs sm:grid-cols-[7rem_minmax(0,1fr)]">
                <dt>Source</dt>
                <dd className="break-all font-mono">{source.id}</dd>
                <dt>Version</dt>
                <dd className="break-all font-mono">{source.version}</dd>
                <dt>Fingerprint</dt>
                <dd className="break-all font-mono">{source.sha256}</dd>
                {source.context_source_version_id && (
                  <>
                    <dt>Context version</dt>
                    <dd className="break-all font-mono">
                      {source.context_source_version_id}
                    </dd>
                  </>
                )}
                {typeof source.locator === "string" && (
                  <>
                    <dt>Locator</dt>
                    <dd className="break-all">{source.locator}</dd>
                  </>
                )}
              </dl>
            </li>
          ))}
        </ul>
        {manifest.success && (
          <div className="mt-5 space-y-3">
            <h3 className="font-medium">Assessment citations</h3>
            <p className="text-xs text-muted-foreground">
              {manifest.data.method} · {manifest.data.compilerVersion}
            </p>
            <ul className="space-y-1 text-xs">
              {manifest.data.requestIds.map((requestId) => (
                <li key={requestId} className="break-all">
                  Request: {requestId}
                </li>
              ))}
            </ul>
            <AssessmentEvidenceReferences documents={manifest.data.documents} />
          </div>
        )}
        {!sources.length && (
          <p className="mt-3">No source details are available.</p>
        )}
      </details>
    </div>
  );
}
