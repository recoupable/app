import { expect, it } from "vitest";
import { GET } from "../../../app/s/spotify/connect/route";
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
