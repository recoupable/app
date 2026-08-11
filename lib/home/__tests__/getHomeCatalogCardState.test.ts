import { describe, expect, it } from "vitest";
import { getHomeCatalogCardState } from "@/lib/home/getHomeCatalogCardState";
import type { Catalog } from "@/types/Catalog";
import type { CatalogMeasurementsResponse } from "@/lib/catalog/getCatalogMeasurements";

const catalog: Catalog = {
  id: "cat-1",
  name: "Del Water Gap Catalog",
  created_at: "2026-07-20T00:00:00Z",
  updated_at: "2026-07-20T00:00:00Z",
};

const measurements: CatalogMeasurementsResponse = {
  status: "success",
  measurements: [{ isrc: "USABC1234567", playcount: 1200000 }],
  measured_song_count: 7,
  valuation: { low: 7000, mid: 10000, high: 14000 },
  artist_account_id: null,
};

describe("getHomeCatalogCardState", () => {
  it("hides the card when the account has no claimed catalog", () => {
    expect(
      getHomeCatalogCardState({
        catalog: undefined,
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("hides the card when the catalogs read failed", () => {
    expect(
      getHomeCatalogCardState({
        catalog,
        catalogsFailed: true,
        measurements,
        measurementsFailed: false,
      }),
    ).toEqual({ show: false });
  });

  it("shows the claimed catalog with valuation when measurements are trustworthy", () => {
    expect(
      getHomeCatalogCardState({
        catalog,
        catalogsFailed: false,
        measurements,
        measurementsFailed: false,
      }),
    ).toEqual({
      show: true,
      catalogId: "cat-1",
      catalogName: "Del Water Gap Catalog",
      valuation: { low: 7000, mid: 10000, high: 14000 },
      measuredTrackCount: 7,
    });
  });

  it("shows the card without numbers when measurements failed", () => {
    expect(
      getHomeCatalogCardState({
        catalog,
        catalogsFailed: false,
        measurements: undefined,
        measurementsFailed: true,
      }),
    ).toEqual({
      show: true,
      catalogId: "cat-1",
      catalogName: "Del Water Gap Catalog",
      valuation: null,
      measuredTrackCount: null,
    });
  });

  it("omits numbers from a pre-v2 response missing the whole-scope aggregate", () => {
    expect(
      getHomeCatalogCardState({
        catalog,
        catalogsFailed: false,
        measurements: {
          ...measurements,
          measured_song_count: undefined,
          artist_account_id: undefined,
        },
        measurementsFailed: false,
      }),
    ).toEqual({
      show: true,
      catalogId: "cat-1",
      catalogName: "Del Water Gap Catalog",
      valuation: null,
      measuredTrackCount: null,
    });
  });

  it("omits numbers when nothing is measured yet", () => {
    expect(
      getHomeCatalogCardState({
        catalog,
        catalogsFailed: false,
        measurements: { ...measurements, measured_song_count: 0 },
        measurementsFailed: false,
      }),
    ).toEqual({
      show: true,
      catalogId: "cat-1",
      catalogName: "Del Water Gap Catalog",
      valuation: null,
      measuredTrackCount: null,
    });
  });
});
