"use client";
import { useState } from "react";
import { getEvidenceUnavailableMessage } from "@/lib/releases/assessmentEvidence/getEvidenceUnavailableMessage";
import { useAssessmentEvidenceValidation } from "@/hooks/useAssessmentEvidenceValidation";
import { Button } from "@/components/ui/button";
import type { CompanyAssessmentSnapshot } from "@/lib/releases/assessmentTypes";
import { getAssessmentEvidenceChoices } from "@/lib/releases/assessmentEvidence/getAssessmentEvidenceChoices";
import { captureAssessmentEvidence } from "@/lib/releases/assessmentEvidence/captureAssessmentEvidence";

export default function AssessmentEvidenceSelection({
  snapshot,
  busy,
  isCurrentSnapshot,
  organizationId,
  getAccessToken,
}: {
  organizationId: string | null;
  getAccessToken: () => Promise<string | null>;
  snapshot: CompanyAssessmentSnapshot | null;
  busy: boolean;
  isCurrentSnapshot: (snapshot: CompanyAssessmentSnapshot) => boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [captured, setCaptured] =
    useState<ReturnType<typeof captureAssessmentEvidence>>(null);
  const [unavailable, setUnavailable] = useState(false);
  const validation = useAssessmentEvidenceValidation(
    organizationId,
    getAccessToken,
    () => !!snapshot && !busy && isCurrentSnapshot(snapshot),
  );
  const choices = getAssessmentEvidenceChoices(snapshot);
  const disabled = busy || !choices;
  const capture = () => {
    validation.invalidate();
    if (!snapshot || busy || !isCurrentSnapshot(snapshot)) {
      setCaptured(null);
      setUnavailable(true);
      return;
    }
    const result = captureAssessmentEvidence(snapshot, selectedIds);
    setCaptured(result);
    setUnavailable(!result);
  };
  return (
    <section
      aria-label="Local evidence selection"
      className="space-y-3 rounded-xl bg-muted/30 p-4 text-sm"
    >
      <h3 className="font-medium">Select evidence for a follow-up</h3>
      <p className="text-muted-foreground">
        Capture a selection locally, then check its saved evidence with the
        server. Checking does not save changes or send anything to chat.
      </p>
      {!choices ? (
        <p>
          Open a saved assessment with complete source references to select
          documents.
        </p>
      ) : (
        <fieldset disabled={disabled} className="space-y-2">
          <legend>Select up to eight evidence documents</legend>
          {choices.map((row) => {
            const checked = selectedIds.includes(row.documentId);
            return (
              <label
                key={row.documentId}
                className="flex min-h-11 items-start gap-3 py-2"
              >
                <input
                  type="checkbox"
                  className="mt-1 size-5 shrink-0 accent-brand-link"
                  checked={checked}
                  disabled={!checked && selectedIds.length >= 8}
                  onChange={() => {
                    if (!snapshot || !isCurrentSnapshot(snapshot)) return;
                    validation.invalidate();
                    setSelectedIds(
                      checked
                        ? selectedIds.filter((id) => id !== row.documentId)
                        : [...selectedIds, row.documentId],
                    );
                    setCaptured(null);
                    setUnavailable(false);
                  }}
                />
                <span className="min-w-0">
                  <span className="block">
                    {row.topic.replaceAll("_", " ")} · version {row.version}
                  </span>
                  <span className="block break-all font-mono text-xs">
                    {row.documentId}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="min-h-11"
          disabled={disabled || !selectedIds.length}
          onClick={capture}
        >
          Capture selection locally
        </Button>
        <Button
          variant="ghost"
          className="min-h-11"
          disabled={busy || !selectedIds.length}
          onClick={() => {
            validation.invalidate();
            setSelectedIds([]);
            setCaptured(null);
            setUnavailable(false);
          }}
        >
          Clear selection
        </Button>
      </div>
      <p role="status">
        {busy
          ? "Selection unavailable while the assessment is loading."
          : unavailable
            ? "Selection unavailable. Review the current assessment and select again."
            : captured
              ? `${captured.selected_evidence.length} evidence ${captured.selected_evidence.length === 1 ? "document" : "documents"} captured locally. Not saved or sent to chat.`
              : `${selectedIds.length} documents selected locally.`}
      </p>
      {captured && !busy && (
        <div className="space-y-2">
          <Button
            variant="outline"
            className="min-h-11"
            disabled={validation.status.state === "pending"}
            onClick={() => void validation.validate(captured)}
          >
            Check captured evidence
          </Button>
          <p role="status">
            {validation.status.state === "pending"
              ? "Checking captured evidence…"
              : validation.status.state === "available"
                ? "Captured evidence was available when checked. This does not confirm facts or grant permission to act."
                : validation.status.state === "unavailable"
                  ? getEvidenceUnavailableMessage(validation.status)
                  : validation.status.state === "error"
                    ? "Could not verify captured evidence. Check your access and try again."
                    : "Captured evidence has not been checked."}
          </p>
          {validation.status.state === "available" && (
            <ul aria-label="Checked evidence">
              {validation.status.documents.map((document) => (
                <li key={document.documentId} className="break-all">
                  {document.kind} · {document.documentId}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {captured && !busy && (
        <label className="block">
          Captured evidence references
          <textarea
            readOnly
            value={JSON.stringify(captured, null, 2)}
            className="mt-2 min-h-48 w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
          />
        </label>
      )}
    </section>
  );
}
