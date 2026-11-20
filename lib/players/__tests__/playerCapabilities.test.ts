import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getPlayerConfig } from "../getPlayerConfig";
import { GET } from "@/app/listen/[id]/route";
import { spotifyRuntimeHarness } from "@/lib/sites/__tests__/fixtures/spotifyRuntimeHarness";
const id = "10000000-0000-4000-8000-000000000001";
const capabilities = (configured = false) => ({
  version: 1,
  spotify: {
    clientConfiguration: configured ? "configured" : "unconfigured",
    releaseConfigured: true,
    premiumEligibility: "unknown",
    tokenStatus: "unknown",
    scopeStatus: "unknown",
    playbackSupport: "unknown",
  },
});
const base = {
  playerId: id,
  name: "Release <img src=x>",
  spotifyUrl: "https://open.spotify.com/track/abc",
  appleUrl: "https://music.apple.com/us/album/song/123",
  revision: 1,
  freePlayback: "spotify",
};
beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
function serve(value: unknown) {
  vi.mocked(fetch).mockImplementation(async () => Response.json(value));
}
it("retains a validated v1 observation without exposing unexpected properties", async () => {
  serve({
    ...base,
    capabilities: { ...capabilities(), privateToken: "never" },
  });
  expect(await getPlayerConfig(id, new URLSearchParams())).toMatchObject({
    capabilities: capabilities(),
  });
  const result = await getPlayerConfig(id, new URLSearchParams());
  expect(result).not.toHaveProperty("capabilities.privateToken");
});
it.each([
  undefined,
  { version: 2, spotify: { clientConfiguration: "unconfigured" } },
])("ignores legacy/future capability shapes (%j)", async (value) => {
  serve({ ...base, capabilities: value });
  expect(
    (await getPlayerConfig(id, new URLSearchParams())).capabilities,
  ).toBeUndefined();
});
it.each([
  { version: 1 },
  { version: 1, spotify: { ...capabilities().spotify, tokenStatus: "valid" } },
  {
    version: 1,
    spotify: { ...capabilities().spotify, releaseConfigured: "yes" },
  },
])("rejects malformed v1 (%j)", async (value) => {
  serve({ ...base, capabilities: value });
  await expect(getPlayerConfig(id, new URLSearchParams())).rejects.toThrow();
});
it.each(["spotify", "audio"])(
  "avoids an impossible sign-in invitation while retaining %s fallback",
  async (mode) => {
    serve({ ...base, freePlayback: mode, capabilities: capabilities() });
    const response = await GET(
      new Request(
        "https://app.recoupable.dev/listen/" +
          id +
          "?campaign=%22%3E%3Cscript%3E",
      ),
      { params: Promise.resolve({ id }) },
    );
    const html = await response.text();
    expect(html).toContain("Spotify sign-in is unavailable.");
    expect(html).not.toContain("Sign in with Spotify");
    expect(html).toContain("Open Spotify");
    expect(html.includes("Open player")).toBe(mode === "audio");
    expect(html).toContain("Sign in with Apple");
    expect(html).toContain("Release &lt;img src=x&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("campaign=%22%3E%3Cscript%3E");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0][1]).not.toHaveProperty("method");
    expect(String(vi.mocked(fetch).mock.calls[0][0])).not.toContain("/session");
  },
);
it.each([
  undefined,
  capabilities(true),
  { version: 2, spotify: { clientConfiguration: "unconfigured" } },
])(
  "preserves configured/legacy/future chooser behavior (%j)",
  async (value) => {
    serve({ ...base, capabilities: value });
    const html = await (
      await GET(new Request("https://app.recoupable.dev/listen/" + id), {
        params: Promise.resolve({ id }),
      })
    ).text();
    expect(html).toContain("Sign in with Spotify");
  },
);
it("retains Apple-only choices", async () => {
  serve({
    ...base,
    spotifyUrl: null,
    capabilities: {
      ...capabilities(),
      spotify: { ...capabilities().spotify, releaseConfigured: false },
    },
  });
  const html = await (
    await GET(new Request("https://app.recoupable.dev/listen/" + id), {
      params: Promise.resolve({ id }),
    })
  ).text();
  expect(html).not.toContain("Open Spotify");
  expect(html).toContain("Sign in with Apple");
});
it.each([
  [false, true],
  [true, false],
])(
  "capabilities never override a negative configuration guard (%s,%s)",
  async (capConfigured, legacyConfigured) => {
    const h = spotifyRuntimeHarness(false, null, "?authorize=tab");
    Object.assign(h.ctx.document.body.dataset, {
      playerConfig: JSON.stringify({
        capabilities: capabilities(capConfigured),
        spotify: {
          configured: legacyConfigured,
          clientId: "public",
          redirectUri: "https://example.test/s/spotify/callback",
          scopes: [],
        },
      }),
    });
    await h.run();
    expect(h.nodes["spotify-connect"].disabled).toBe(true);
    expect(h.fetch).not.toHaveBeenCalled();
    expect(h.ctx.location.assign).not.toHaveBeenCalled();
    expect(h.nodes["spotify-status"].textContent).toContain("not configured");
  },
);
