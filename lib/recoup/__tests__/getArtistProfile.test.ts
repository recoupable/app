import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import getArtistProfile from "@/lib/recoup/getArtistProfile";

const ARTIST = "5e9eca42-b5af-47ef-83c9-3e498506a3d6";

const profile = {
  id: ARTIST,
  name: "Brauxelion",
  image: "https://cdn.example/b.jpg",
  socials: [
    {
      type: "SPOTIFY",
      username: "brauxelion",
      profile_url: "https://open.spotify.com/artist/abc",
    },
  ],
  catalogs: [
    { id: "cat_1", name: "Brauxelion Catalog", song_count: 24, updated_at: "2026-08-01" },
  ],
};

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("getArtistProfile", () => {
  it("fetches the public profile endpoint with no auth header and ISR caching", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify(profile), { status: 200 }),
    );

    const result = await getArtistProfile(ARTIST);

    expect(result).toEqual(profile);
    const [url, init] = vi.mocked(global.fetch).mock.calls[0];
    expect(String(url)).toMatch(new RegExp(`/api/artists/${ARTIST}/profile$`));
    expect(init).toEqual({ next: { revalidate: 300 } });
  });

  it("returns null on 404 so the page can render notFound()", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: "error", message: "Artist not found" }), {
        status: 404,
      }),
    );

    expect(await getArtistProfile(ARTIST)).toBeNull();
  });

  it("throws on any other non-ok status", async () => {
    vi.mocked(global.fetch).mockResolvedValue(new Response("nope", { status: 500 }));

    await expect(getArtistProfile(ARTIST)).rejects.toThrow(/500/);
  });
});
