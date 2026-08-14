import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRosterArtist } from "@/lib/artists/createRosterArtist";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: vi.fn(),
}));

describe("createRosterArtist", () => {
  const accessToken = "test-token";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientApiBaseUrl).mockReturnValue(
      "https://api.recoupable.com",
    );
  });

  it("POSTs the artist name with bearer auth and returns the artist", async () => {
    const artist = { id: "artist-1", account_id: "artist-1", name: "New Act" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue({ artist }),
    }) as unknown as typeof fetch;

    const result = await createRosterArtist(accessToken, "New Act");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.recoupable.com/api/artists",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
        body: JSON.stringify({ name: "New Act" }),
      }),
    );
    expect(result).toEqual({ artist, created: true });
  });

  it("includes organization_id when an org is provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue({ artist: { id: "a" } }),
    }) as unknown as typeof fetch;

    await createRosterArtist(accessToken, "New Act", "org-1");

    const body = JSON.parse(
      vi.mocked(global.fetch).mock.calls[0][1]?.body as string,
    );
    expect(body).toEqual({ name: "New Act", organization_id: "org-1" });
  });

  it("throws the API error message on failure responses", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi
        .fn()
        .mockResolvedValue({ status: "error", error: "name is required" }),
    }) as unknown as typeof fetch;

    await expect(createRosterArtist(accessToken, "")).rejects.toThrow(
      "name is required",
    );
  });

  it("throws when the response has no artist", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue({}),
    }) as unknown as typeof fetch;

    await expect(createRosterArtist(accessToken, "New Act")).rejects.toThrow(
      "Failed to create artist",
    );
  });
  // Row 8 (chat#1889): 200 = the API linked an existing canonical.
  it("reports created: false when the API returns 200 (canonical reused)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ artist: { id: "canonical-1" } }),
    }) as unknown as typeof fetch;

    const result = await createRosterArtist(
      accessToken,
      "Del Water Gap",
      null,
      "0xPoVNPnxIIUS1vrxAYV00",
    );

    expect(result.created).toBe(false);
    const body = JSON.parse(
      vi.mocked(global.fetch).mock.calls[0][1]?.body as string,
    );
    expect(body.spotify_artist_id).toBe("0xPoVNPnxIIUS1vrxAYV00");
  });
});
