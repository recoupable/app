import { expect, it, vi } from "vitest";
import { spotifyRuntimeHarness as harness } from "./fixtures/spotifyRuntimeHarness";
function listeningHarness(product: string, embedded = false, profileOk = true) {
  const h = harness(false);
  Object.assign(h.ctx.document.body.dataset, {
    listeningOnly: "true",
    playerConfig: JSON.stringify({
      playerId: "release",
      sessionId: "session",
      spotify: { configured: true },
      flow: "signed",
    }),
    release: "https://open.spotify.com/playlist/abc",
    playerParent: embedded ? "https://artist.example" : "",
  });
  h.storage.set(
    "recoup-player-spotify:release",
    JSON.stringify({
      access_token: "private",
      player_session_id: "session",
      expiresAt: Date.now() + 3600000,
      fanCapture: true,
    }),
  );
  const parent = { postMessage: vi.fn() };
  Object.assign(h.ctx.window, { parent });
  const head = { appendChild: vi.fn() };
  Object.assign(h.ctx.document, { head });
  h.fetch.mockResolvedValue({ ok: profileOk, json: async () => ({ product }) });
  return { ...h, parent, head };
}
it.each(["free", "open"])(
  "hands standalone %s accounts to Spotify without loading browser streaming",
  async (product) => {
    const h = listeningHarness(product);
    await h.run();
    expect(h.ctx.location.assign).toHaveBeenCalledWith(
      "https://open.spotify.com/playlist/abc",
    );
    expect(h.head.appendChild).not.toHaveBeenCalled();
    expect(h.nodes["spotify-continue"]).toMatchObject({ hidden: true });
  },
);
it("asks the verified parent to hand off without sending tokens or destination overrides", async () => {
  const h = listeningHarness("free", true);
  await h.run();
  expect(h.parent.postMessage).toHaveBeenCalledWith(
    { type: "recoup:open-dsp", provider: "spotify" },
    "https://artist.example",
  );
  expect(JSON.stringify(h.parent.postMessage.mock.calls)).not.toContain(
    "private",
  );
  expect(h.ctx.location.assign).not.toHaveBeenCalled();
  expect(h.head.appendChild).not.toHaveBeenCalled();
});
it("keeps Premium in the registered browser player", async () => {
  const h = listeningHarness("premium");
  await h.run();
  expect(h.ctx.location.assign).not.toHaveBeenCalled();
  expect(h.head.appendChild).toHaveBeenCalledWith(
    expect.objectContaining({ src: "https://sdk.scdn.co/spotify-player.js" }),
  );
});
it("does not classify a failed profile lookup as Spotify Free", async () => {
  const h = listeningHarness("free", true, false);
  await h.run();
  expect(h.ctx.document.body.dataset).toMatchObject({
    spotifyProduct: "unknown",
  });
  expect(
    h.parent.postMessage.mock.calls.some(
      ([message]) => message.type === "recoup:open-dsp",
    ),
  ).toBe(false);
  expect(h.ctx.location.assign).not.toHaveBeenCalled();
});
