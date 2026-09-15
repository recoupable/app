import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchArtists } from "@/lib/artists/fetchArtists";
import type { ArtistRecord } from "@/types/Artist";
import type { SOCIAL } from "@/types/Agent";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.example.test",
}));

const profile = (id: string): SOCIAL => ({
  id,
  link: `https://instagram.com/${id}`,
  type: "INSTAGRAM",
  artistId: "artist-1",
  bio: null,
  followerCount: 0,
  followingCount: 0,
  avatar: null,
  username: id,
  region: null,
});

afterEach(() => vi.unstubAllGlobals());

describe("fetchArtists", () => {
  it("returns one artist and one row per social ID, preserving distinct profiles", async () => {
    const first = profile("profile-1");
    const second = profile("profile-2");
    const artists: ArtistRecord[] = [
      {
        account_id: "artist-1",
        name: "First artist",
        pinned: true,
        account_socials: [first, first],
      },
      {
        account_id: "artist-2",
        name: "Second artist",
        account_socials: [first],
      },
      {
        account_id: "artist-1",
        name: "Duplicate artist",
        account_socials: [first, second],
      },
    ];
    const original = structuredClone(artists);
    const request = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", artists }),
    });
    vi.stubGlobal("fetch", request);

    const result = await fetchArtists("test-token", "org-1");

    expect(result).toEqual([
      { ...artists[0], account_socials: [first, second] },
      artists[1],
    ]);
    expect(artists).toEqual(original);
    expect(request).toHaveBeenCalledWith(
      "https://api.example.test/api/artists?org_id=org-1",
      { headers: { Authorization: "Bearer test-token" } },
    );
  });

  it("keeps artists without socials and merges profiles from later duplicate rows", async () => {
    const social = profile("profile-1");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "success",
          artists: [
            { account_id: "empty", name: "No profiles" },
            { account_id: "artist-1", name: "Artist" },
            {
              account_id: "artist-1",
              name: "Artist",
              account_socials: [social],
            },
          ],
        }),
      }),
    );
    expect(await fetchArtists("test-token")).toEqual([
      { account_id: "empty", name: "No profiles", account_socials: [] },
      { account_id: "artist-1", name: "Artist", account_socials: [social] },
    ]);
  });

  it("returns an empty roster when no artists are supplied", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "success" }),
      }),
    );
    expect(await fetchArtists("test-token")).toEqual([]);
  });

  it.each([
    { ok: false, status: "success" },
    { ok: true, status: "error" },
  ])(
    "preserves API failures instead of showing an empty roster: %o",
    async ({ ok, status }) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok,
          json: async () => ({ status, error: "Roster unavailable" }),
        }),
      );
      await expect(fetchArtists("test-token")).rejects.toThrow(
        "Roster unavailable",
      );
    },
  );
});
