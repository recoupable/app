import { describe, expect, it } from "vitest";
import { getValuationHeroState } from "@/lib/home/getValuationHeroState";
import type { CatalogMeasurementsResponse } from "@/lib/catalog/getCatalogMeasurements";
import type { Catalog } from "@/types/Catalog";

const catalog: Catalog = {
  id: "catalog-1",
  name: "Del Water Gap",
  created_at: "2026-07-06T00:00:00Z",
  updated_at: "2026-07-06T00:00:00Z",
};

const measurements: CatalogMeasurementsResponse = {
  status: "success",
  measurements: [
    { isrc: "USABC1234567", playcount: 1000 },
    { isrc: "USABC1234568", playcount: 2000 },
  ],
  valuation: { low: 959000, mid: 1400000, high: 2000000 },
};

describe("getValuationHeroState", () => {
  it("hides the hero while catalogs are still loading", () => {
    expect(
      getValuationHeroState({
        catalogs: undefined,
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the account has no catalogs", () => {
    expect(
      getValuationHeroState({
        catalogs: [],
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the catalogs request failed", () => {
    expect(
      getValuationHeroState({
        catalogs: undefined,
        catalogsFailed: true,
        measurements: undefined,
        measurementsFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when measurements are unavailable (endpoint 404/error)", () => {
    expect(
      getValuationHeroState({
        catalogs: [catalog],
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: true,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero while measurements are still loading", () => {
    expect(
      getValuationHeroState({
        catalogs: [catalog],
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the response has no valuation band", () => {
    expect(
      getValuationHeroState({
        catalogs: [catalog],
        catalogsFailed: false,
        measurements: {
          status: "success",
          measurements: [],
        } as unknown as CatalogMeasurementsResponse,
        measurementsFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("shows the valuation and measured track count when data is complete", () => {
    expect(
      getValuationHeroState({
        catalogs: [catalog],
        catalogsFailed: false,
        measurements,
        measurementsFailed: false,
      }),
    ).toEqual({
      show: true,
      catalogName: "Del Water Gap",
      valuation: { low: 959000, mid: 1400000, high: 2000000 },
      measuredTrackCount: 2,
    });
  });
});
