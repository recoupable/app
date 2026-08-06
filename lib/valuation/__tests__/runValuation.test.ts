import { beforeEach, describe, expect, it, vi } from "vitest";
import { runValuation } from "@/lib/valuation/runValuation";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("runValuation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue("https://api.example.com");
  });

  it("POSTs the spotify_artist_id to /api/valuation with bearer auth", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;

    await runValuation("tok", "0xPoV");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/valuation",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
        body: JSON.stringify({ spotify_artist_id: "0xPoV" }),
      }),
    );
  });

  it("names the organization as the catalog owner when one is selected", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;

    await runValuation("tok", "0xPoV", "5d511b7e-de11-4566-ae90-b5fd5535d900");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/valuation",
      expect.objectContaining({
        body: JSON.stringify({
          spotify_artist_id: "0xPoV",
          organization_id: "5d511b7e-de11-4566-ae90-b5fd5535d900",
        }),
      }),
    );
  });

  // `null` is the personal-account state of `selectedOrgId`, and the api 403s a
  // null organization_id rather than treating it as absent.
  it("omits organization_id on the personal account", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true }) as unknown as typeof fetch;

    await runValuation("tok", "0xPoV", null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/valuation",
      expect.objectContaining({
        body: JSON.stringify({ spotify_artist_id: "0xPoV" }),
      }),
    );
  });

  it("throws on a non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      text: vi.fn().mockResolvedValue("insufficient credits"),
    }) as unknown as typeof fetch;

    await expect(runValuation("tok", "0xPoV")).rejects.toThrow("402");
  });
});
