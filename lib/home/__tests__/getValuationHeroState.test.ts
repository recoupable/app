import { describe, expect, it } from "vitest";
import { getValuationHeroState } from "@/lib/home/getValuationHeroState";
import type { CatalogMeasurementsResponse } from "@/lib/catalog/getCatalogMeasurements";
import type { Catalog } from "@/types/Catalog";

const catalog: Catalog = {
  id: "catalog-1",
  name: "Full Roster Catalog",
  created_at: "2026-07-06T00:00:00Z",
  updated_at: "2026-07-06T00:00:00Z",
};

const artistAccountId = "b1814076-8e19-4a77-9dea-2ec150e26aaa";

const wholeCatalogMeasurements: CatalogMeasurementsResponse = {
  status: "success",
  measurements: [
    { isrc: "USABC1234567", playcount: 1000 },
    { isrc: "USABC1234568", playcount: 2000 },
  ],
  valuation: { low: 959000, mid: 1400000, high: 2000000 },
  artist_account_id: null,
};

const artistScopedMeasurements: CatalogMeasurementsResponse = {
  status: "success",
  measurements: [{ isrc: "USABC1234567", playcount: 1000 }],
  valuation: { low: 100000, mid: 146000, high: 205000 },
  artist_account_id: artistAccountId,
};

describe("getValuationHeroState", () => {
  it("hides the hero while catalogs are still loading / the account has none", () => {
    expect(
      getValuationHeroState({
        catalog: undefined,
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: false,
        selectedArtistName: null,
        selectedArtistAccountId: null,
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
        selectedArtistAccountId: null,
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
        selectedArtistAccountId: null,
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
        selectedArtistAccountId: null,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the response has no measurements (empty scope)", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: {
          status: "success",
          measurements: [],
          valuation: { low: 0, mid: 0, high: 0 },
          artist_account_id: null,
        },
        measurementsFailed: false,
        selectedArtistName: null,
        selectedArtistAccountId: null,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the selected artist has zero measured songs in the catalog", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: {
          status: "success",
          measurements: [],
          valuation: { low: 0, mid: 0, high: 0 },
          artist_account_id: artistAccountId,
        },
        measurementsFailed: false,
        selectedArtistName: "Elvis Crespo",
        selectedArtistAccountId: artistAccountId,
      }),
    ).toEqual({ show: false });
  });

  it("shows the whole-catalog valuation (catalog label) when no artist is selected", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: wholeCatalogMeasurements,
        measurementsFailed: false,
        selectedArtistName: null,
        selectedArtistAccountId: null,
      }),
    ).toEqual({
      show: true,
      showArtist: false,
      catalogName: "Full Roster Catalog",
      valuation: { low: 959000, mid: 1400000, high: 2000000 },
      measuredTrackCount: 2,
    });
  });

  it("shows the artist-labeled hero when the response echoes the requested artist scope", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: artistScopedMeasurements,
        measurementsFailed: false,
        selectedArtistName: "Elvis Crespo",
        selectedArtistAccountId: artistAccountId,
      }),
    ).toEqual({
      show: true,
      showArtist: true,
      catalogName: "Full Roster Catalog",
      valuation: { low: 100000, mid: 146000, high: 205000 },
      measuredTrackCount: 1,
    });
  });

  it("hides the hero when an artist is selected but the response is not artist-scoped (pre-v2 api: no echo field)", () => {
    // A pre-v2 deployment ignores the unknown artist_account_id param and
    // returns whole-catalog numbers with no echo — rendering them under the
    // artist's name would be wrong-scoped money.
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: {
          status: "success",
          measurements: [
            { isrc: "USABC1234567", playcount: 1000 },
            { isrc: "USABC1234568", playcount: 2000 },
          ],
          valuation: { low: 959000, mid: 1400000, high: 2000000 },
        },
        measurementsFailed: false,
        selectedArtistName: "Elvis Crespo",
        selectedArtistAccountId: artistAccountId,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the echoed scope is a different artist than the one selected", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: artistScopedMeasurements,
        measurementsFailed: false,
        selectedArtistName: "Apache",
        selectedArtistAccountId: "ebae4bb9-e38f-4763-b3c8-ff30e99f5d01",
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the echoed scope is null but an artist is selected (stale whole-catalog response)", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: wholeCatalogMeasurements,
        measurementsFailed: false,
        selectedArtistName: "Elvis Crespo",
        selectedArtistAccountId: artistAccountId,
      }),
    ).toEqual({ show: false });
  });
});
