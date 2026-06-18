import { describe, it, expect } from "vitest";
import { isValidElement } from "react";
import { getConnectorIcon } from "../getConnectorIcon";
import { formatConnectorName } from "../formatConnectorName";
import { getConnectorMeta } from "../connectorMetadata";

/**
 * Display coverage for the artist-facing social connectors. Each slug must
 * render a branded icon (not the generic Link2 fallback), a clean name, and a
 * real description — otherwise X / LinkedIn / YouTube look broken in the tab.
 */
describe("connector display: X, LinkedIn, YouTube", () => {
  const fallbackIconType = (getConnectorIcon("unknown-slug-xyz") as { type: unknown }).type;

  it("getConnectorIcon returns a branded (non-fallback) icon for twitter, linkedin, youtube", () => {
    for (const slug of ["twitter", "linkedin", "youtube"]) {
      const el = getConnectorIcon(slug) as { type: unknown };
      expect(isValidElement(el)).toBe(true);
      expect(el.type).not.toBe(fallbackIconType);
    }
  });

  it("formatConnectorName maps twitter and linkedin to clean display names", () => {
    expect(formatConnectorName("X (Twitter)", "twitter")).toBe("X (Twitter)");
    expect(formatConnectorName("LinkedIn", "linkedin")).toBe("LinkedIn");
  });

  it("connectorMetadata has non-default descriptions for twitter and linkedin", () => {
    const fallback = getConnectorMeta("unknown-slug-xyz").description;
    expect(getConnectorMeta("twitter").description).not.toBe(fallback);
    expect(getConnectorMeta("linkedin").description).not.toBe(fallback);
  });
});
