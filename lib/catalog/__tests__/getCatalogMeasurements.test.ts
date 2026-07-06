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
