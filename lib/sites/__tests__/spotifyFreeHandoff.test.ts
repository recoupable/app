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

function addUploadedAudio(
  h: ReturnType<typeof listeningHarness>,
  available = true,
) {
  const audio = {
    src: available ? "https://storage.test/song.mp3" : "",
    duration: 180,
    currentTime: 0,
    paused: true,
    volume: 0,
    addEventListener: vi.fn(),
    play: vi.fn(async () => {
      audio.paused = false;
    }),
    pause: vi.fn(() => {
      audio.paused = true;
    }),
  };
  Object.assign(h.nodes, {
    "site-audio": audio,
    "spotify-play": {
      dataset: {},
      setAttribute: vi.fn(),
      hidden: true,
      disabled: true,
    },
    "spotify-previous": { setAttribute: vi.fn() },
  });
  const dataset = h.ctx.document.body.dataset as Record<string, string>;
  const config = JSON.parse(dataset.playerConfig);
  dataset.playerConfig = JSON.stringify({
    ...config,
    freePlayback: "audio",
  });
  return audio;
}
it.each([false, true])(
  "keeps Free fans in uploaded-file playback when selected (embedded: %s)",
  async (embedded) => {
    const h = listeningHarness("free", embedded),
      audio = addUploadedAudio(h);
    await h.run();
    expect(h.ctx.document.body.dataset).toMatchObject({
      playbackSource: "audio",
      playerVisible: "true",
    });
    expect(h.ctx.location.assign).not.toHaveBeenCalled();
    expect(
      h.parent.postMessage.mock.calls.some(
        ([message]) => message.type === "recoup:open-dsp",
      ),
    ).toBe(false);
    expect(h.head.appendChild).not.toHaveBeenCalled();
    await h.nodes["spotify-play"].onclick!();
    expect(audio.play).toHaveBeenCalledOnce();
  },
);
it("falls back to Spotify if configured uploaded audio is absent", async () => {
  const h = listeningHarness("free");
  addUploadedAudio(h, false);
  await h.run();
  expect(h.ctx.location.assign).toHaveBeenCalledWith(
    "https://open.spotify.com/playlist/abc",
  );
});
it.each(["premium", "unknown"])(
  "does not switch %s accounts to uploaded-file playback",
  async (product) => {
    const h = listeningHarness(product);
    addUploadedAudio(h);
    await h.run();
    expect(
      (h.ctx.document.body.dataset as Record<string, string>).playbackSource,
    ).not.toBe("audio");
    expect(h.head.appendChild).toHaveBeenCalled();
  },
);
it("requires sign-in before offering the registered audio fallback", async () => {
  const h = listeningHarness("free");
  addUploadedAudio(h);
  h.storage.clear();
  await h.run();
  expect(
    (h.ctx.document.body.dataset as Record<string, string>).playbackSource,
  ).not.toBe("audio");
});
it("requests the API-configured permissions for registered-player authorization", async () => {
  const h = harness(false);
  Object.assign(h.ctx.document.body.dataset, {
    listeningOnly: "true",
    playerConfig: JSON.stringify({
      playerId: "release",
      sessionId: "session",
      flow: "signed",
      spotify: {
        configured: true,
        clientId: "client",
        redirectUri: "https://example.test/s/spotify/callback",
        scopes: ["streaming", "user-read-playback-state"],
      },
    }),
  });
  h.ctx.location.search = "?authorize=tab";
  await h.run();
  const destination = new URL(h.ctx.location.assign.mock.calls[0][0]);
  expect(destination.searchParams.get("scope")).toBe(
    "streaming user-read-playback-state",
  );
});
