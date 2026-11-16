import { expect, it } from "vitest";
import { canRestoreAuditNote } from "../canRestoreAuditNote";
import { appendAuditNote } from "../appendAuditNote";
import { parsePrepared } from "../schemas";
import fixture from "./fixtures/released-catalog-audit.json";

it("restores across reordered JSON keys while rejecting changed values", () => {
  const snapshot = parsePrepared(
    fixture.prepare.response,
    fixture.prepare.response.snapshot.workspace_id,
    fixture.prepare.request.brief_id,
  );
  const previous = appendAuditNote(snapshot, "Retain my draft");
  const noteId = Object.keys(previous.assessments).find(
    (id) => id !== "assessment:context",
  )!;
  const reorder = (value: unknown): unknown =>
    Array.isArray(value)
      ? value.map(reorder)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value)
              .reverse()
              .map(([key, nested]) => [key, reorder(nested)]),
          )
        : value;
  const current = structuredClone(snapshot);
  current.assessments = reorder(
    current.assessments,
  ) as typeof current.assessments;
  expect(canRestoreAuditNote(previous, current, noteId)).toBe(true);
  const assessment = current.assessments["assessment:context"];
  if (!("summary" in assessment)) throw new Error("Expected full assessment");
  assessment.summary = "Changed summary";
  expect(canRestoreAuditNote(previous, current, noteId)).toBe(false);
});
