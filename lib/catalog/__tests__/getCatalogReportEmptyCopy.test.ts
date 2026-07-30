import { describe, expect, it } from "vitest";
import { getCatalogReportEmptyCopy } from "@/lib/catalog/getCatalogReportEmptyCopy";

const states = ["signed-out", "measuring", "other-account", "error"] as const;

describe("getCatalogReportEmptyCopy", () => {
  it.each(states)("gives %s a title and a body", (state) => {
    const copy = getCatalogReportEmptyCopy(state);

    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.body.length).toBeGreaterThan(0);
  });

  // chat#1912 architecture decision: the empty state never sends a signed-in
  // customer back to the marketing site. Bouncing them off-app at the moment of
  // peak interest is what produced the duplicate valuation run.
  it.each(states)("never points %s off-app to recoupable.dev", (state) => {
    const copy = getCatalogReportEmptyCopy(state);

    expect(`${copy.title} ${copy.body}`).not.toContain("recoupable.dev");
    expect(copy.cta?.href ?? "").not.toContain("recoupable.dev");
  });

  // House style: em dashes read as machine-written in product copy.
  it.each(states)("keeps %s copy free of em dashes", (state) => {
    const copy = getCatalogReportEmptyCopy(state);

    expect(`${copy.title} ${copy.body}`).not.toMatch(/[—–]/);
  });

  it("tells a cross-account viewer the catalog belongs to another account", () => {
    const copy = getCatalogReportEmptyCopy("other-account");

    expect(copy.title.toLowerCase()).toContain("another account");
    // The old copy claimed no valuation existed, which was false: the catalog
    // is measured, just not by this viewer.
    expect(copy.title.toLowerCase()).not.toContain("no valuation found");
  });

  it("offers a signed-out visitor a way in", () => {
    const copy = getCatalogReportEmptyCopy("signed-out");

    expect(copy.cta?.action).toBe("login");
  });

  it("keeps a cross-account viewer in-app", () => {
    const copy = getCatalogReportEmptyCopy("other-account");

    expect(copy.cta?.href).toBe("/catalogs");
  });

  it("offers no CTA while measuring, because there is nothing to do", () => {
    expect(getCatalogReportEmptyCopy("measuring").cta).toBeUndefined();
  });

  // chat#1912 row 6 chain (recoupable/docs#282 -> recoupable/api#802): catalog
  // songs become account-scoped, so a non-owner will no longer see the songs
  // tab either. Copy that points them at Manage songs would be promising a
  // tab that now fails.
  it("does not promise a cross-account viewer the songs tab", () => {
    const copy = getCatalogReportEmptyCopy("other-account");

    expect(copy.body.toLowerCase()).not.toContain("manage songs");
  });
});
