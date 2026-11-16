import { expect, it } from "vitest";
import { captureAssessmentEvidence } from "../captureAssessmentEvidence";
import { getAssessmentEvidenceChoices } from "../getAssessmentEvidenceChoices";
import { id, snapshot } from "./assessmentFixture";
it("captures only exact selected six-key rows in selection order from a detached saved origin", () => {
  const input = structuredClone(snapshot);
  if (input.state !== "saved") throw Error();
  Object.assign(input.brief.input_manifest!.documents[0], {
    hiddenText: "must not escape",
    kind: "recording",
  });
  const value = captureAssessmentEvidence(input, [id(11), id(10)])!;
  expect(value.brief_id).toBe(id(1));
  expect(value.selected_evidence.map((row) => row.documentId)).toEqual([
    id(11),
    id(10),
  ]);
  expect(Object.keys(value.selected_evidence[1]).sort()).toEqual(
    [
      "documentId",
      "resultId",
      "subjectId",
      "topic",
      "version",
      "sourceVersionIds",
    ].sort(),
  );
  expect(value.selected_evidence[1].resultId).toBeNull();
  input.brief.input_manifest!.documents[0].sourceVersionIds.push(id(99));
  expect(value.selected_evidence[1].sourceVersionIds).toEqual([id(70)]);
});
it.each([
  { ids: [] },
  { ids: [id(10), id(10)] },
  { ids: [id(999)] },
  { ids: Array.from({ length: 9 }, (_, i) => id(10 + i)) },
])(
  "rejects empty, duplicate, missing or over-limit selection %j",
  ({ ids }) => {
    expect(captureAssessmentEvidence(snapshot, ids)).toBeNull();
  },
);
it.each([true, undefined])(
  "requires explicit non-superseded state: %s",
  (superseded) => {
    expect(
      getAssessmentEvidenceChoices({ ...snapshot, superseded }),
    ).toBeNull();
  },
);
it("rejects unavailable snapshots and absent lineage without disturbing legacy readability", () => {
  expect(
    getAssessmentEvidenceChoices({
      id: id(1),
      state: "unavailable",
      brief: null,
      superseded: false,
    }),
  ).toBeNull();
  const input = structuredClone(snapshot);
  if (input.state !== "saved") throw Error();
  delete input.brief.input_manifest;
  expect(captureAssessmentEvidence(input, [id(10)])).toBeNull();
});
it.each([
  "duplicate-document",
  "empty-source",
  "duplicate-source",
  "too-many-sources",
  "invalid-uuid",
  "invalid-topic",
  "nonfinite-version",
])("rejects malformed/ambiguous saved lineage: %s", (mode) => {
  const input = structuredClone(snapshot);
  if (input.state !== "saved") throw Error();
  const rows = input.brief.input_manifest!.documents;
  if (mode === "duplicate-document") rows[1].documentId = rows[0].documentId;
  if (mode === "empty-source") rows[0].sourceVersionIds = [];
  if (mode === "duplicate-source")
    rows[0].sourceVersionIds.push(rows[0].sourceVersionIds[0]);
  if (mode === "too-many-sources")
    rows[0].sourceVersionIds = Array.from({ length: 33 }, (_, i) =>
      id(100 + i),
    );
  if (mode === "invalid-uuid") rows[0].subjectId = "recording from title";
  if (mode === "invalid-topic") rows[0].topic = "x".repeat(129);
  if (mode === "nonfinite-version") rows[0].version = Infinity;
  expect(captureAssessmentEvidence(input, [id(10)])).toBeNull();
});
