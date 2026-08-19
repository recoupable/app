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

  it("POSTs the spotify_artist_id to /api/valuation with bearer auth and returns the result", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi
        .fn()
        .mockResolvedValue({ status: "success", catalog: { id: "cat_1" }, songs_measured: 12 }),
    }) as unknown as typeof fetch;

    const result = await runValuation("tok", "0xPoV");
    expect(result.catalog?.id).toBe("cat_1");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/valuation",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
        body: JSON.stringify({ spotify_artist_id: "0xPoV" }),
      }),
    );
  });

  // The API's error string is the diagnostic ("No releases found for this
  // Spotify artist" exposed a wrong-duplicate profile pick in live use) — it
  // must reach the caller verbatim, never wrapped in a generic message.
  it("throws the API's error string verbatim on a non-ok response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: vi
        .fn()
        .mockResolvedValue(
          JSON.stringify({ status: "error", error: "No releases found for this Spotify artist" }),
        ),
    }) as unknown as typeof fetch;

    await expect(runValuation("tok", "0xPoV")).rejects.toThrow(
      "No releases found for this Spotify artist",
    );
  });

  it("falls back to the status code when the error body is not JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: vi.fn().mockResolvedValue("<html>bad gateway</html>"),
    }) as unknown as typeof fetch;

    await expect(runValuation("tok", "0xPoV")).rejects.toThrow("502");
  });
});
