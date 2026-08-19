import { describe, expect, it } from "vitest";
import { getCatalogReportEmptyCopy } from "@/lib/catalog/getCatalogReportEmptyCopy";

const states = ["signed-out", "measuring", "other-account", "error", "no_streams"] as const;

const withCatalogs = { hasOwnCatalogs: true };
const withoutCatalogs = { hasOwnCatalogs: false };

describe("getCatalogReportEmptyCopy", () => {
  it.each(states)("gives %s a title and a body", (state) => {
    const copy = getCatalogReportEmptyCopy(state, withCatalogs);

    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.body.length).toBeGreaterThan(0);
  });

  // chat#1912 architecture decision: the empty state never sends a signed-in
  // customer back to the marketing site. Bouncing them off-app at the moment of
  // peak interest is what produced the duplicate valuation run.
  it.each(states)("never points %s off-app to recoupable.dev", (state) => {
    const copy = getCatalogReportEmptyCopy(state, withCatalogs);

    expect(`${copy.title} ${copy.body}`).not.toContain("recoupable.dev");
    expect(copy.cta?.href ?? "").not.toContain("recoupable.dev");
  });

  // House style: em dashes read as machine-written in product copy.
  it.each(states)("keeps %s copy free of em dashes", (state) => {
    const copy = getCatalogReportEmptyCopy(state, withCatalogs);

    expect(`${copy.title} ${copy.body}`).not.toMatch(/[—–]/);
  });

  it("tells a cross-account viewer the catalog belongs to another account", () => {
    const copy = getCatalogReportEmptyCopy("other-account", withCatalogs);

    expect(copy.title.toLowerCase()).toContain("another account");
    // The old copy claimed no valuation existed, which was false: the catalog
    // is measured, just not by this viewer.
    expect(copy.title.toLowerCase()).not.toContain("no valuation found");
  });

  // chat#1969: with the zero-stream shell email gone, this page is where a
  // zero-stream signup learns what happened. Honest, with a next step.
  it("tells a zero-stream viewer the catalog was measured with no plays yet", () => {
    const copy = getCatalogReportEmptyCopy("no_streams", withCatalogs, {
      measuredSongCount: 29,
    });

    expect(copy.title).toBe("No streams found yet");
    expect(copy.body).toContain("29 tracks");
    expect(copy.body.toLowerCase()).toContain("no spotify plays");
    expect(copy.cta).toEqual({ label: "Connect your profiles", href: "/setup/socials" });
  });

  it("keeps the zero-stream copy honest without a track count", () => {
    const copy = getCatalogReportEmptyCopy("no_streams", withCatalogs);

    expect(copy.body).not.toContain("undefined");
    expect(copy.body.toLowerCase()).toContain("no spotify plays");
  });

  it("offers a signed-out visitor a way in", () => {
    const copy = getCatalogReportEmptyCopy("signed-out", withCatalogs);

    expect(copy.cta?.action).toBe("login");
  });

  it("keeps a cross-account viewer in-app", () => {
    const copy = getCatalogReportEmptyCopy("other-account", withCatalogs);

    expect(copy.cta?.href).toBe("/catalogs");
  });

  it("offers no CTA while measuring, because there is nothing to do", () => {
    expect(
      getCatalogReportEmptyCopy("measuring", withCatalogs).cta,
    ).toBeUndefined();
  });

  // chat#1912 row 6 chain (recoupable/docs#282 -> recoupable/api#802): catalog
  // songs become account-scoped, so a non-owner will no longer see the songs
  // tab either. Copy that points them at Manage songs would be promising a
  // tab that now fails.
  it("does not promise a cross-account viewer the songs tab", () => {
    const copy = getCatalogReportEmptyCopy("other-account", withCatalogs);

    expect(copy.body.toLowerCase()).not.toContain("manage songs");
  });

  // Review (@sweetmantech): a viewer who cannot see this catalog should get a
  // way forward, not a paragraph. "Go to your catalogs" is only a happy path
  // for someone who has catalogs — a stranger following a shared link usually
  // has none, and would land on an empty page. So the action adapts.
  it("sends a viewer who has catalogs to their own", () => {
    const copy = getCatalogReportEmptyCopy("other-account", withCatalogs);

    expect(copy.cta?.href).toBe("/catalogs");
  });

  it("offers a viewer with no catalogs the way to get one", () => {
    const copy = getCatalogReportEmptyCopy("other-account", withoutCatalogs);

    expect(copy.cta?.href).toBe("/setup/artists");
    expect(copy.cta?.label.toLowerCase()).toContain("value");
  });

  it("always gives the cross-account state something to click", () => {
    expect(
      getCatalogReportEmptyCopy("other-account", withCatalogs).cta,
    ).toBeDefined();
    expect(
      getCatalogReportEmptyCopy("other-account", withoutCatalogs).cta,
    ).toBeDefined();
  });

  // The measuring state resolves on its own, so a button would invite exactly
  // the redundant re-run this whole issue exists to stop.
  it("still offers nothing to click while measuring", () => {
    expect(
      getCatalogReportEmptyCopy("measuring", withCatalogs).cta,
    ).toBeUndefined();
  });
});
