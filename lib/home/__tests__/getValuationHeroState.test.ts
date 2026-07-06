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
        catalog: undefined,
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: false,
        selectedArtistName: null,
        artistMatched: undefined,
        artistMatchFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the account has no catalogs", () => {
    expect(
      getValuationHeroState({
        catalog: undefined,
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: false,
        selectedArtistName: null,
        artistMatched: undefined,
        artistMatchFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the catalogs request failed", () => {
    expect(
      getValuationHeroState({
        catalog: undefined,
        catalogsFailed: true,
        measurements: undefined,
        measurementsFailed: false,
        selectedArtistName: null,
        artistMatched: undefined,
        artistMatchFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when measurements are unavailable (endpoint 404/error)", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: true,
        selectedArtistName: null,
        artistMatched: undefined,
        artistMatchFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero while measurements are still loading", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: false,
        selectedArtistName: null,
        artistMatched: undefined,
        artistMatchFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the response has no valuation band", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: {
          status: "success",
          measurements: [],
        } as unknown as CatalogMeasurementsResponse,
        measurementsFailed: false,
        selectedArtistName: null,
        artistMatched: undefined,
        artistMatchFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("shows the whole-catalog valuation (catalog label) when no artist is selected", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements,
        measurementsFailed: false,
        selectedArtistName: null,
        artistMatched: undefined,
        artistMatchFailed: false,
      }),
    ).toEqual({
      show: true,
      showArtist: false,
      catalogName: "Del Water Gap",
      valuation: { low: 959000, mid: 1400000, high: 2000000 },
      measuredTrackCount: 2,
    });
  });

  it("hides the hero while the selected artist's catalog match is still resolving", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements,
        measurementsFailed: false,
        selectedArtistName: "Del Water Gap",
        artistMatched: undefined,
        artistMatchFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the selected artist does not match the catalog", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements,
        measurementsFailed: false,
        selectedArtistName: "Ana Bárbara",
        artistMatched: false,
        artistMatchFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the artist match check failed", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements,
        measurementsFailed: false,
        selectedArtistName: "Del Water Gap",
        artistMatched: undefined,
        artistMatchFailed: true,
      }),
    ).toEqual({ show: false });
  });

  it("shows the artist-labeled hero when the selected artist has songs in the catalog", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements,
        measurementsFailed: false,
        selectedArtistName: "Del Water Gap",
        artistMatched: true,
        artistMatchFailed: false,
      }),
    ).toEqual({
      show: true,
      showArtist: true,
      catalogName: "Del Water Gap",
      valuation: { low: 959000, mid: 1400000, high: 2000000 },
      measuredTrackCount: 2,
    });
  });
});
