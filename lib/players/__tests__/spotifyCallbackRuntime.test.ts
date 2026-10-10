import { expect, it } from "vitest";
import { spotifyRuntimeHarness as harness } from "../../sites/__tests__/fixtures/spotifyRuntimeHarness";
it("exchanges registered player codes through Recoup's audience-bound server endpoint", async () => {
  const h = harness(
    true,
    {
      state: "ok",
      created: Date.now(),
      returnPath: "/s/spotify/connect",
      clientId: "recoup-client",
      redirectUri: "https://example.test/s/spotify/callback",
      verifier: "v".repeat(64),
      flow: "signed-flow",
    },
    "?code=provider-code&state=ok",
  );
  h.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      access_token: "token",
      expires_in: 3600,
      player_session_id: "listening-session",
      fanCapture: true,
    }),
  });
  await h.run();
  expect(h.fetch.mock.calls[0][0]).toBe("/api/players/spotify/session");
  expect(JSON.parse(h.fetch.mock.calls[0][1].body)).toEqual({
    code: "provider-code",
    verifier: "v".repeat(64),
    flow: "signed-flow",
  });
  expect(JSON.parse(h.storage.get("recoup-sites-spotify")!)).toHaveProperty(
    "player_session_id",
    "listening-session",
  );
});
it("removes automatic authorization from the same-tab return path", async () => {
  const h = harness(false, null, "?authorize=tab&release=test");
  h.ctx.location.pathname = "/s/spotify/connect";
  h.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      configured: true,
      clientId: "public-id",
      redirectUri: "https://example.test/s/spotify/callback",
    }),
  });
  await h.run();
  const pending = JSON.parse(h.storage.get("recoup-sites-spotify-pending")!);
  expect(pending.popup).toBe(false);
  expect(pending.returnPath).toBe("/s/spotify/connect?release=test");
  expect(h.ctx.location.assign).toHaveBeenCalledWith(
    expect.stringContaining("https://accounts.spotify.com/authorize?"),
  );
});

it("stores provider credentials under the registered player rather than a global site session", async () => {
  const key = "recoup-player-spotify:10000000-0000-4000-8000-000000000001";
  const h = harness(
    true,
    {
      state: "ok",
      created: Date.now(),
      returnPath:
        "/listen/10000000-0000-4000-8000-000000000001/spotify?flow=signed",
      clientId: "public-id",
      redirectUri: "https://example.test/s/spotify/callback",
      verifier: "v".repeat(64),
      flow: "signed",
      sessionKey: key,
    },
    "?code=code&state=ok",
  );
  h.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      access_token: "private-token",
      expires_in: 3600,
      player_session_id: "session",
    }),
  });
  await h.run();
  expect(JSON.parse(h.storage.get(key)!)).toHaveProperty(
    "access_token",
    "private-token",
  );
  expect(h.storage.has("recoup-sites-spotify")).toBe(false);
  expect(h.ctx.location.replace).toHaveBeenCalledWith(
    "/listen/10000000-0000-4000-8000-000000000001/spotify?flow=signed",
  );
});
