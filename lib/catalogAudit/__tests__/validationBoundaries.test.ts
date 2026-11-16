import { expect, it } from "vitest";
import { snapshotSchema, validateSnapshot, parsePrepared } from "../schemas";
import { canContinueAudit } from "../canContinueAudit";
import fixture from "./fixtures/released-catalog-audit.json";
it("rejects full protected data disguised as a withheld placeholder", () => {
  const snapshot = structuredClone(fixture.prepare.response.snapshot);
  Object.assign(snapshot.assessments["assessment:context"], { withheld: true });
  expect(snapshotSchema.safeParse(snapshot).success).toBe(false);
});
it("rejects inherited source names even on stale records", () => {
  const snapshot = snapshotSchema.parse(fixture.prepare.response.snapshot);
  const assessment = snapshot.assessments["assessment:context"];
  if (!("source_refs" in assessment))
    throw new Error("Expected full assessment");
  assessment.stale = true;
  assessment.source_refs = [{ source_id: "constructor", version: "ignored" }];
  expect(() => validateSnapshot(snapshot, snapshot.workspace_id)).toThrow(
    "Invalid evidence reference",
  );
});
it("keeps non-partial assessments read-only", () => {
  const snapshot = parsePrepared(
    fixture.prepare.response,
    fixture.prepare.response.snapshot.workspace_id,
    fixture.prepare.request.brief_id,
  );
  expect(canContinueAudit(snapshot)).toBe(true);
  snapshot.assessments["assessment:context"].status = "complete";
  expect(canContinueAudit(snapshot)).toBe(false);
});

it("rejects a stale initial assessment before the preparation can become writable", () => {
  const response = structuredClone(fixture.prepare.response);
  Object.assign(response.snapshot.assessments["assessment:context"], {
    stale: true,
  });
  expect(() =>
    parsePrepared(
      response,
      response.snapshot.workspace_id,
      fixture.prepare.request.brief_id,
    ),
  ).toThrow("Invalid prepared audit");
});
