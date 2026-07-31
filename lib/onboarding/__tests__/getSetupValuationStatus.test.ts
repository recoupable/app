import { describe, expect, it } from "vitest";
import { getSetupValuationStatus } from "@/lib/onboarding/getSetupValuationStatus";

const base = {
  catalogsPending: false,
  catalogsFailed: false,
  hasCatalog: true,
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

  it("redirects when the account has no catalog to value", () => {
    expect(getSetupValuationStatus({ ...base, hasCatalog: false })).toBe(
      "redirect",
    );
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
