// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { snapshotSchema } from "@/lib/catalogAudit/schemas";
import { appendAuditNote } from "@/lib/catalogAudit/appendAuditNote";
import fixture from "@/lib/catalogAudit/__tests__/fixtures/released-catalog-audit.json";
import CatalogAuditDetails from "../CatalogAuditDetails";
afterEach(cleanup);
it("withholds dependent note text when the original assessment is withheld", () => {
  const snapshot = appendAuditNote(
    snapshotSchema.parse(fixture.prepare.response.snapshot),
    "Private derived note",
  );
  snapshot.assessments["assessment:context"] = {
    id: "assessment:context",
    status: "withheld",
    withheld: true,
  };
  render(<CatalogAuditDetails snapshot={snapshot} saved />);
  expect(screen.queryByText("Private derived note")).toBeNull();
  expect(screen.getByText(/dependent notes are not displayed/)).toBeTruthy();
});
it("shows excluded topics and explains unavailable citation details", () => {
  const snapshot = snapshotSchema.parse(fixture.prepare.response.snapshot);
  const initial = snapshot.assessments["assessment:context"];
  if (!("data" in initial) || !initial.data)
    throw new Error("Expected assessment data");
  (initial.data.input_manifest as { excludedTopics: string[] }).excludedTopics =
    ["private_rights"];
  const view = render(<CatalogAuditDetails snapshot={snapshot} saved />);
  expect(screen.getByText("Excluded topics: private_rights")).toBeTruthy();
  initial.data.input_manifest = null;
  view.rerender(<CatalogAuditDetails snapshot={snapshot} saved />);
  expect(
    screen.getByText(
      "Source-version details are unavailable for this assessment.",
    ),
  ).toBeTruthy();
});
