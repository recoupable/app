import { afterEach, expect, it, vi } from "vitest";
import { resolveSpotifyRelease } from "../resolveSpotifyRelease";
afterEach(() => vi.unstubAllGlobals());
it("normalizes a shared Spotify link and retrieves real release artwork", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      Response.json({
        title: "A release",
        thumbnail_url: "https://i.scdn.co/image/abc",
      }),
    );
  vi.stubGlobal("fetch", fetcher);
  expect(
    await resolveSpotifyRelease(
      "https://open.spotify.com/intl-en/track/abc?si=123",
    ),
  ).toEqual({
    title: "A release",
    url: "https://open.spotify.com/track/abc",
    artwork: "https://i.scdn.co/image/abc",
  });
  expect(fetcher.mock.calls[0][0]).toBe(
    "https://open.spotify.com/oembed?url=https%3A%2F%2Fopen.spotify.com%2Ftrack%2Fabc",
  );
});
it("rejects lookalike hosts before any network request", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await expect(
    resolveSpotifyRelease("https://open.spotify.com.evil.test/track/abc"),
  ).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
});
it("ignores artwork outside Spotify's image hosts", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({
          title: "Release",
          thumbnail_url: "https://localhost/private",
        }),
      ),
  );
  expect(
    (await resolveSpotifyRelease("https://open.spotify.com/album/abc")).artwork,
  ).toBeNull();
});
it("reports unavailable releases without fabricating metadata", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
  );
  await expect(
    resolveSpotifyRelease("https://open.spotify.com/track/abc"),
  ).rejects.toThrow("couldn’t find");
});
