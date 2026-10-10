import { beforeEach, expect, it, vi } from "vitest";
import { GET } from "@/app/listen/[id]/[provider]/route";
const id = "10000000-0000-4000-8000-000000000001";
const config = {
  playerId: id,
  sessionId: id,
  name: "Other artist <release>",
  revision: 1,
  spotifyUrl: "https://open.spotify.com/album/abc",
  appleUrl: "https://music.apple.com/us/album/test/123",
  provider: "spotify",
  release: "https://open.spotify.com/album/abc",
  flow: "signed-flow",
  spotify: {
    configured: true,
    clientId: "public-id",
    redirectUri: "https://app.recoupable.dev/s/spotify/callback",
    scopes: [],
  },
};
beforeEach(() =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => config }),
  ),
);
it("renders any registered release without trusting caller-supplied destinations", async () => {
  const response = await GET(
    new Request(
      `https://app.recoupable.dev/listen/${id}/spotify?parent=https://artist.example`,
    ),
    { params: Promise.resolve({ id, provider: "spotify" }) },
  );
  expect(response.status).toBe(200);
  const [url, options] = vi.mocked(fetch).mock.calls[0];
  expect(String(url)).toContain("/api/players/public/" + id + "/session");
  expect(options).toMatchObject({ method: "POST" });
  expect(JSON.parse(options!.body as string)).toMatchObject({
    provider: "spotify",
    parent: "https://artist.example",
  });
  const html = await response.text();
  expect(html).toContain("data-player-config=");
  expect(html).toContain("Other artist &lt;release&gt;");
  expect(html).not.toContain("Gatsby");
  expect(response.headers.get("content-security-policy")).toContain(
    "frame-ancestors https://artist.example",
  );
});
it("fails closed when API configuration or provider is unavailable", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
  expect(
    (
      await GET(
        new Request(`https://app.recoupable.dev/listen/${id}/spotify`),
        { params: Promise.resolve({ id, provider: "spotify" }) },
      )
    ).status,
  ).toBe(503);
  expect(
    (
      await GET(new Request(`https://app.recoupable.dev/listen/${id}/evil`), {
        params: Promise.resolve({ id, provider: "evil" }),
      })
    ).status,
  ).toBe(400);
});

it("renders Apple destinations from the same registered player", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...config,
        provider: "apple_music",
        release: config.appleUrl,
      }),
    }),
  );
  const response = await GET(
    new Request(`https://app.recoupable.dev/listen/${id}/apple_music`),
    { params: Promise.resolve({ id, provider: "apple_music" }) },
  );
  const html = await response.text();
  expect(response.status).toBe(200);
  expect(html).toContain('data-release-id="123"');
  expect(html).not.toContain("developerToken");
});
