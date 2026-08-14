import { describe, expect, it } from "vitest";
import { getSetupValuationStatus } from "@/lib/onboarding/getSetupValuationStatus";

const base = {
  artistsPending: false,
  catalogsPending: false,
  catalogsFailed: false,
  hasCatalog: true,
  hasArtists: true,
  valuationReady: false,
};

describe("getSetupValuationStatus", () => {
  // `isPending`, not `isLoading`: useCatalogs is enabled: !!accountId &&
  // authenticated, and a disabled TanStack v5 query reports isPending true /
  // isFetching false. Redirecting on isLoading bounced every cold load of the
  // route the welcome email points at.
  it("is loading while the catalog list is pending", () => {
    expect(getSetupValuationStatus({ ...base, catalogsPending: true })).toBe(
      "loading",
    );
  });

  /**
   * Second preview run, 2026-07-31: the roster loads asynchronously, so on a
   * fresh page load `sorted` is briefly empty. Reading that as "no artists"
   * redirected the signup before seeding could be detected — the same trap the
   * catalogs `isPending` comment in this file warns about, repeated for the
   * roster.
   */
  it("is loading while the roster has not resolved", () => {
    expect(
      getSetupValuationStatus({
        ...base,
        artistsPending: true,
        hasCatalog: false,
        hasArtists: false,
      }),
    ).toBe("loading");
  });

  it("redirects when the account has neither a catalog nor an artist", () => {
    expect(
      getSetupValuationStatus({ ...base, hasCatalog: false, hasArtists: false }),
    ).toBe("redirect");
  });

  /**
   * Measured on the preview 2026-07-31: seeding creates the catalog **15
   * seconds** after the artist is added (artist 00:59:04 → snapshot 00:59:07 →
   * catalog 00:59:19), because createSnapshotCatalog runs only once the
   * measurements land. For that whole window there is no catalog, so treating
   * an empty list as "nothing to value" bounced a signup who followed the flow
   * onto an empty /catalogs. The window this route was originally written for
   * (catalog exists, not yet measured) is about one second by comparison.
   */
  it("is measuring when seeding is still in flight: artists but no catalog yet", () => {
    expect(
      getSetupValuationStatus({ ...base, hasCatalog: false, hasArtists: true }),
    ).toBe("measuring");
  });

  it("redirects when the catalog list failed", () => {
    expect(getSetupValuationStatus({ ...base, catalogsFailed: true })).toBe(
      "redirect",
    );
  });

  // chat#1912 row 9: seeding creates the catalog seconds after the first artist
  // is added and the measurements land later, so this window is routine — and
  // it is the state that has to resolve on its own rather than stranding the
  // signup on static text.
  it("is measuring when a catalog exists but has no valuation yet", () => {
    expect(getSetupValuationStatus(base)).toBe("measuring");
  });

  it("is ready once the valuation arrives", () => {
    expect(getSetupValuationStatus({ ...base, valuationReady: true })).toBe(
      "ready",
    );
  });

  // A pending list must never be read as "no catalog", which would redirect a
  // signup away from the payoff page mid-load.
  it("prefers loading over redirect when both could apply", () => {
    expect(
      getSetupValuationStatus({
        ...base,
        catalogsPending: true,
        hasCatalog: false,
      }),
    ).toBe("loading");
  });
});
