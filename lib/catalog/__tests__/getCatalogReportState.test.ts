import { describe, expect, it } from "vitest";
import { getCatalogReportState } from "@/lib/catalog/getCatalogReportState";

const base = {
  isAuthenticated: true,
  isLoading: false,
  hasMeasurements: false,
  error: null as Error | null,
  ownsCatalog: false,
};

describe("getCatalogReportState", () => {
  it("is loading while either query is in flight", () => {
    expect(getCatalogReportState({ ...base, isLoading: true })).toBe("loading");
  });

  // chat#1912 row 1: an anonymous visitor got "Something went wrong loading the
  // measurements", because the measurements query is gated on auth and never
  // runs — a disabled query is not a failure, and must not read as one.
  it("is signed-out for an anonymous visitor rather than an error", () => {
    expect(
      getCatalogReportState({ ...base, isAuthenticated: false }),
    ).toBe("signed-out");
  });

  it("stays signed-out even though the disabled query left no error behind", () => {
    expect(
      getCatalogReportState({
        ...base,
        isAuthenticated: false,
        error: null,
      }),
    ).toBe("signed-out");
  });

  it("is ready once measurements arrive", () => {
    expect(getCatalogReportState({ ...base, hasMeasurements: true })).toBe(
      "ready",
    );
  });

  // The catalog is the viewer's own and the api has no measurements for it yet,
  // which is what a freshly seeded catalog looks like. Ben re-ran the entire
  // valuation flow because this rendered as an empty report.
  it("is measuring when the viewer owns a catalog the api has not measured yet", () => {
    expect(
      getCatalogReportState({
        ...base,
        ownsCatalog: true,
        error: new Error("HTTP 404: not found"),
      }),
    ).toBe("measuring");
  });

  // chat#1912 row 1: the catalog exists and is measured, just not by this
  // account. "No valuation found" plus an off-app CTA is the wrong story.
  it("is other-account when the viewer does not own the catalog", () => {
    expect(
      getCatalogReportState({
        ...base,
        ownsCatalog: false,
        error: new Error("HTTP 404: not found"),
      }),
    ).toBe("other-account");
  });

  it("is a real error for non-404 failures, whoever is looking", () => {
    expect(
      getCatalogReportState({
        ...base,
        ownsCatalog: true,
        error: new Error("HTTP 500: upstream exploded"),
      }),
    ).toBe("error");
    expect(
      getCatalogReportState({
        ...base,
        ownsCatalog: false,
        error: new Error("HTTP 500: upstream exploded"),
      }),
    ).toBe("error");
  });

  it("treats a missing response with no error as measuring for an owner", () => {
    expect(
      getCatalogReportState({ ...base, ownsCatalog: true, error: null }),
    ).toBe("measuring");
  });
});
