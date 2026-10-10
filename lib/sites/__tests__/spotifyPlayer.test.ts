import { expect, it, vi } from "vitest";
import { getPublishedSite } from "../getPublishedSite";
import { GET } from "../../../app/s/spotify/connect/route";
vi.mock("../getPublishedSite", () => ({ getPublishedSite: vi.fn() }));

it("connects through the site's server-provided fan signup URL", async () => {
  vi.mocked(getPublishedSite).mockResolvedValueOnce({
    published: {} as never,
    fanConnectUrl:
      "https://api.recoupable.dev/api/sites/public/11111111-1111-4111-8111-111111111111/spotify",
    playbackAudioUrl: null,
  });
  const response = await GET(
    new Request(
      "https://example.test/s/spotify/connect?site=11111111-1111-4111-8111-111111111111&release=https://open.spotify.com/track/abc",
    ),
  );
  const html = await response.text();
  expect(html).toContain('id="fan-connect"');
  expect(html).toContain(
    'data-fan-connect-url="https://api.recoupable.dev/api/sites/public/11111111-1111-4111-8111-111111111111/spotify"',
  );
  expect(html).not.toContain('type="email"');
});
it("rejects non-Spotify and markup-bearing release links", async () => {
  for (const release of [
    "https://evil.test/track/abc",
    'https://open.spotify.com/track/abc?x=" onload="bad',
  ]) {
    const response = await GET(
      new Request(
        "https://example.test/s/spotify/connect?release=" +
          encodeURIComponent(release),
      ),
    );
    expect(response.status).toBe(400);
  }
});
it("renders a trusted standalone player without exposing draft data", async () => {
  const response = await GET(
    new Request(
      "https://example.test/s/spotify/connect?release=" +
        encodeURIComponent("https://open.spotify.com/track/abc?si=123&foo=bar"),
    ),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.get("Content-Security-Policy")).toContain(
    "frame-ancestors 'none'",
  );
  const html = await response.text();
  expect(html).toContain('data-spotify-player="true"');
  expect(html).toContain("si=123&amp;foo=bar");
  expect(html).not.toContain("client_secret");
});
it("only permits embedded playback on known app origins", async () => {
  const base =
    "http://127.0.0.1:3002/s/spotify/connect?release=https://open.spotify.com/track/abc";
  expect(
    (await GET(new Request(base + "&parent=https://evil.test"))).status,
  ).toBe(400);
  const response = await GET(
    new Request(base + "&parent=http://localhost:3002"),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Security-Policy")).toContain(
    "http://localhost:3002",
  );
  const html = await response.text();
  expect(html).toContain('data-player-parent="http://localhost:3002"');
  expect(html).toContain('id="spotify-seek"');
  expect(html).toContain('id="spotify-volume"');
});
it("rejects unsafe audio fallbacks", async () => {
  const response = await GET(
    new Request(
      "https://example.test/s/spotify/connect?release=https://open.spotify.com/track/abc&audio=javascript:alert(1)",
    ),
  );
  expect(response.status).toBe(400);
});
it("uses validated release colors and escapes release titles", async () => {
  const url = new URL("https://example.test/s/spotify/connect");
  const theme = {
    release: "https://open.spotify.com/track/abc",
    background: "#101010",
    foreground: "#ffffff",
    accent: "#ffdd00",
    font: "serif",
    title: "<img src=x onerror=alert(1)>",
    artwork: "https://i.scdn.co/image/abc",
  };
  Object.entries(theme).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  const response = await GET(new Request(url));
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).toContain("--release-accent:#ffdd00");
  expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  expect(html).not.toContain("<img src=x");
  url.searchParams.set("accent", "red;}body{display:none");
  expect((await GET(new Request(url))).status).toBe(400);
});
it("requires external websites to use a registered release player", async () => {
  expect(
    (
      await GET(
        new Request(
          "https://app.recoupable.dev/s/spotify/connect?release=https://open.spotify.com/track/abc&parent=https://artist.example",
        ),
      )
    ).status,
  ).toBe(400);
});

it("omits game navigation from an explicit listening destination", async () => {
  const response = await GET(
    new Request(
      "https://app.recoupable.dev/s/spotify/connect?mode=listen&release=https://open.spotify.com/track/abc",
    ),
  );
  const html = await response.text();
  expect(html).not.toContain('id="spotify-skip"');
  expect(html).toContain('id="spotify-play"');
});
