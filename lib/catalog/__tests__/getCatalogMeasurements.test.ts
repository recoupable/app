import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCatalogMeasurements } from "@/lib/catalog/getCatalogMeasurements";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("getCatalogMeasurements", () => {
  const accessToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue(
      "https://api.recoupable.com",
    );
  });

  it("calls GET /api/catalogs/measurements with catalogId and bearer auth", async () => {
    const payload = {
      status: "success",
      measurements: [
        { isrc: "USABC1234567", playcount: 1000 },
        { isrc: "USABC1234568", playcount: 2000 },
      ],
      valuation: { low: 959000, mid: 1400000, high: 2000000 },
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    }) as unknown as typeof fetch;

    const result = await getCatalogMeasurements("catalog-1", accessToken);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/catalogs/measurements?catalogId=catalog-1",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
    expect(result).toEqual(payload);
  });

  it("passes artist_account_id and returns the scope echo when artist-scoped", async () => {
    const payload = {
      status: "success",
      measurements: [{ isrc: "USABC1234567", playcount: 1000 }],
      valuation: { low: 100, mid: 200, high: 300 },
      artist_account_id: "b1814076-8e19-4a77-9dea-2ec150e26aaa",
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    }) as unknown as typeof fetch;

    const result = await getCatalogMeasurements(
      "catalog-1",
      accessToken,
      "b1814076-8e19-4a77-9dea-2ec150e26aaa",
    );

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/catalogs/measurements?catalogId=catalog-1&artist_account_id=b1814076-8e19-4a77-9dea-2ec150e26aaa",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.artist_account_id).toBe(
      "b1814076-8e19-4a77-9dea-2ec150e26aaa",
    );
  });

  it("omits artist_account_id from the query when not provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        measurements: [],
        valuation: { low: 0, mid: 0, high: 0 },
        artist_account_id: null,
      }),
    }) as unknown as typeof fetch;

    await getCatalogMeasurements("catalog-1", accessToken);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/catalogs/measurements?catalogId=catalog-1",
      expect.anything(),
    );
  });

  it("passes limit through and returns the whole-scope count", async () => {
    const payload = {
      status: "success",
      measurements: [{ isrc: "USABC1234567", playcount: 1000 }],
      measured_song_count: 2679,
      valuation: { low: 100, mid: 200, high: 300 },
      artist_account_id: null,
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    }) as unknown as typeof fetch;

    const result = await getCatalogMeasurements(
      "catalog-1",
      accessToken,
      undefined,
      1,
    );

    expect(fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/catalogs/measurements?catalogId=catalog-1&limit=1",
      expect.anything(),
    );
    expect(result.measured_song_count).toBe(2679);
  });

  it("throws on a non-ok response (endpoint not deployed yet)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: vi.fn().mockResolvedValue("Not Found"),
    }) as unknown as typeof fetch;

    await expect(
      getCatalogMeasurements("catalog-1", accessToken),
    ).rejects.toThrow("HTTP 404");
  });

  it("throws when the envelope reports an error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "error",
        error: "Catalog not found",
      }),
    }) as unknown as typeof fetch;

    await expect(
      getCatalogMeasurements("catalog-1", accessToken),
    ).rejects.toThrow("Catalog not found");
  });
});
