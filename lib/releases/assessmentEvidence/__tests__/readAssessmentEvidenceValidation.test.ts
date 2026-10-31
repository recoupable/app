import { expect, it } from "vitest";
import { snapshot, id } from "./assessmentFixture";
import { captureAssessmentEvidence } from "../captureAssessmentEvidence";
import { readAssessmentEvidenceValidation } from "../readAssessmentEvidenceValidation";
const capture = captureAssessmentEvidence(snapshot, [id(10), id(11)])!;
const valid = () => ({
  snapshot,
  evidence_validation: {
    state: "available",
    documents: capture.selected_evidence.map((row) => ({
      documentId: row.documentId,
      subjectId: row.subjectId,
      sourceVersionIds: row.sourceVersionIds,
      kind: "material",
      identityConfirmed: true,
    })),
  },
});
it("retains the actual server kind and ordered whole selection", () => {
  expect(readAssessmentEvidenceValidation(valid(), capture)).toEqual(
    valid().evidence_validation,
  );
});
it("preserves unavailable separately from malformed responses", () => {
  expect(
    readAssessmentEvidenceValidation(
      {
        snapshot: { ...snapshot, superseded: true },
        evidence_validation: { state: "unavailable" },
      },
      capture,
    ),
  ).toEqual({ state: "unavailable" });
});
it.each([
  "missing",
  "extra",
  "duplicate",
  "order",
  "subject",
  "source",
  "kind",
  "identity",
  "snapshot",
  "superseded",
  "absent",
])("rejects %s authority mismatch", (mode) => {
  const value = valid();
  const rows = value.evidence_validation.documents;
  if (mode === "missing") rows.pop();
  if (mode === "extra") rows.push({ ...rows[0], documentId: id(900) });
  if (mode === "duplicate") rows[1] = rows[0];
  if (mode === "order") rows.reverse();
  if (mode === "subject") rows[0].subjectId = id(900);
  if (mode === "source") rows[0].sourceVersionIds = [id(900)];
  if (mode === "kind") rows[0].kind = "unknown";
  if (mode === "identity") rows[0].identityConfirmed = false;
  if (mode === "snapshot") value.snapshot = { ...snapshot, id: id(900) };
  if (mode === "superseded") value.snapshot = { ...snapshot, superseded: true };
  if (mode === "absent")
    delete (value as Partial<typeof value>).evidence_validation;
  expect(() => readAssessmentEvidenceValidation(value, capture)).toThrow();
});
