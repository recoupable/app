import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ModelRoutingStatus } from "../ModelRoutingStatus";
describe("ModelRoutingStatus", () => {
  it("does not render for old or malformed metadata", () => {
    expect(renderToStaticMarkup(<ModelRoutingStatus metadata={{}} />)).toBe("");
  });
  it("announces routing while it runs", () => {
    expect(
      renderToStaticMarkup(
        <ModelRoutingStatus metadata={{ routing: { status: "selecting" } }} />,
      ),
    ).toContain("Jev is choosing");
  });
  it("shows a persisted decision and honest fallback explanation", () => {
    const html = renderToStaticMarkup(
      <ModelRoutingStatus
        metadata={{
          routing: {
            status: "selected",
            source: "fallback",
            tier: "frontier",
            modelId: "anthropic/claude-opus-4.8",
            reason: "Low confidence",
            confidence: 0.3,
          },
        }}
      />,
    );
    expect(html).toContain("Claude Opus 4.8");
    expect(html).toContain("Auto fallback");
    expect(html).toContain("Low confidence");
    expect(html).toContain("30%");
  });
});
