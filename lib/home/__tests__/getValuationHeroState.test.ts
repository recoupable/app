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

// The hero requests limit=1 — the rows page is minimal; the whole-scope
// aggregate measured_song_count is the source of truth for visibility/count.
const wholeCatalogMeasurements: CatalogMeasurementsResponse = {
  status: "success",
  measurements: [{ isrc: "USABC1234567", playcount: 2000 }],
  measured_song_count: 2679,
  valuation: { low: 959000, mid: 1400000, high: 2000000 },
  artist_account_id: null,
};

const artistScopedMeasurements: CatalogMeasurementsResponse = {
  status: "success",
  measurements: [{ isrc: "USABC1234567", playcount: 1000 }],
  measured_song_count: 322,
  valuation: { low: 100000, mid: 146000, high: 205000 },
  artist_account_id: artistAccountId,
};

describe("getValuationHeroState", () => {
  // chat#1969: with the zero-stream shell email deleted, the app must not show
  // a $0 band either. The hero hides (homepage falls back to the chat
  // greeting) and reports why, so /setup/valuation can render its honest state.
  it("hides the hero for a measured catalog with zero streams and says why", () => {
    const state = getValuationHeroState({
      catalog,
      catalogsFailed: false,
      measurements: {
        ...wholeCatalogMeasurements,
        total_streams: 0,
        valuation: { low: 0, mid: 0, high: 0 },
        measured_song_count: 29,
      },
      measurementsFailed: false,
      selectedArtistName: null,
      selectedArtistAccountId: null,
    });

    expect(state).toEqual({ show: false, noStreams: { measuredTrackCount: 29 } });
  });

  it("does not trust a zero-stream verdict from a response outside the selected artist scope", () => {
    // Artist selected, but the response does not echo that scope (pre-v2 api
    // or unscoped read): whole-catalog zeros must not become a terminal
    // no-streams verdict for the artist. Plain hide, no noStreams.
    const state = getValuationHeroState({
      catalog,
      catalogsFailed: false,
      measurements: {
        ...wholeCatalogMeasurements,
        total_streams: 0,
        valuation: { low: 0, mid: 0, high: 0 },
        measured_song_count: 29,
        artist_account_id: null,
      },
      measurementsFailed: false,
      selectedArtistName: "Nova",
      selectedArtistAccountId: artistAccountId,
    });

    expect(state).toEqual({ show: false });
  });

  it("still shows the hero when total_streams is absent (pre-v2 response shape)", () => {
    const state = getValuationHeroState({
      catalog,
      catalogsFailed: false,
      measurements: wholeCatalogMeasurements,
      measurementsFailed: false,
      selectedArtistName: null,
      selectedArtistAccountId: null,
    });

    expect(state.show).toBe(true);
  });

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

  it("hides the hero when nothing in scope is measured (measured_song_count 0)", () => {
    expect(
      getValuationHeroState({
        catalog,
        catalogsFailed: false,
        measurements: {
          status: "success",
          measurements: [],
          measured_song_count: 0,
          valuation: { low: 0, mid: 0, high: 0 },
          artist_account_id: null,
        },
        measurementsFailed: false,
        selectedArtistName: null,
        selectedArtistAccountId: null,
      }),
    ).toEqual({ show: false });
  });

  it("hides the hero when the response has no measured_song_count (pre-v2 api shape)", () => {
    // The v1 endpoint returns rows but no whole-scope count — its numbers are
    // computed over a capped read, so the hero must not trust them.
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
          measured_song_count: 0,
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
      measuredTrackCount: 2679,
    });
  });

  it("counts from measured_song_count, not the returned page size", () => {
    const result = getValuationHeroState({
      catalog,
      catalogsFailed: false,
      measurements: { ...wholeCatalogMeasurements, measurements: [] },
      measurementsFailed: false,
      selectedArtistName: null,
      selectedArtistAccountId: null,
    });

    expect(result).toMatchObject({ show: true, measuredTrackCount: 2679 });
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
      measuredTrackCount: 322,
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
