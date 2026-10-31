import { expect, it, vi } from "vitest";
import { spotifyRuntimeHarness } from "./fixtures/spotifyRuntimeHarness";

function sessionHarness(expired = true, refresh = false) {
  const h = spotifyRuntimeHarness(false);
  Object.assign(h.ctx.document.body.dataset, {
    playerParent: "https://artist.example",
    playerConfig: JSON.stringify({
      playerId: "release",
      sessionId: "session",
      spotify: { configured: true },
    }),
  });
  h.storage.set(
    "recoup-player-spotify:release",
    JSON.stringify({
      access_token: "synthetic-token",
      player_session_id: "session",
      expiresAt: Date.now() + (expired ? -1000 : 3600000),
      ...(refresh ? { refresh_token: "synthetic-refresh" } : {}),
    }),
  );
  h.storage.set("unrelated-session", "preserve");
  const parent = { postMessage: vi.fn() };
  const events = { event: vi.fn() };
  const head = { appendChild: vi.fn() };
  Object.assign(h.ctx.window, { parent, RecoupReleasePlayer: events });
  Object.assign(h.ctx.document, { head });
  for (const id of ["spotify-play", "spotify-continue", "spotify-disconnect"])
    Object.assign(h.ctx.document.getElementById(id), { hidden: true });
  h.fetch.mockResolvedValue({ ok: false, status: 503 });
  return { ...h, parent, events, head };
}

it("keeps an expired unrefreshable session recoverable without announcing connection", async () => {
  const h = sessionHarness();
  await h.run();
  expect(h.nodes["spotify-status"]).toMatchObject({
    hidden: false,
    textContent: "Your Spotify session expired. Disconnect and reconnect.",
  });
  expect(h.ctx.document.body.dataset).not.toHaveProperty("connected", "true");
  expect(h.events.event).not.toHaveBeenCalledWith("connected");
  expect(h.parent.postMessage).not.toHaveBeenCalled();
  expect(h.fetch).not.toHaveBeenCalled();
  expect(h.head.appendChild).not.toHaveBeenCalled();
  expect(h.nodes["spotify-play"]).toMatchObject({ hidden: true });
  expect(h.nodes["spotify-continue"]).toMatchObject({ hidden: true });
  expect(h.nodes["spotify-disconnect"]).toMatchObject({ hidden: false });
  expect(h.nodes["spotify-skip"]).toMatchObject({ hidden: false });
  await h.nodes["spotify-minimize"].onclick!();
  await h.nodes["spotify-skip"].onclick!();
  expect(h.parent.postMessage.mock.calls).toEqual([
    [{ type: "recoup-music-minimize" }, "https://artist.example"],
    [{ type: "recoup-music-continue" }, "https://artist.example"],
  ]);
  await h.nodes["spotify-disconnect"].onclick!();
  expect(h.storage.has("recoup-player-spotify:release")).toBe(false);
  expect(h.storage.get("unrelated-session")).toBe("preserve");
  expect(h.ctx.location.reload).toHaveBeenCalledOnce();
});

it("keeps a valid session with an unavailable profile connected with unknown eligibility", async () => {
  const h = sessionHarness(false);
  await h.run();
  expect(h.ctx.document.body.dataset).toMatchObject({
    connected: "true",
    spotifyProduct: "unknown",
  });
  expect(h.nodes["spotify-account"].textContent).toBe(
    "Spotify connected · subscription unavailable",
  );
  expect(h.events.event).toHaveBeenCalledWith("connected");
  expect(h.head.appendChild).toHaveBeenCalledOnce();
});

it("does not announce connection when refreshing the expired session fails", async () => {
  const h = sessionHarness(true, true);
  await h.run();
  expect(h.nodes["spotify-status"].textContent).toContain("Please reconnect");
  expect(h.events.event).not.toHaveBeenCalledWith("connected");
  expect(h.head.appendChild).not.toHaveBeenCalled();
  expect(h.fetch).toHaveBeenCalledTimes(1);
});

it("refreshes successfully before reporting connection", async () => {
  const h = sessionHarness(true, true);
  h.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ access_token: "renewed-synthetic", expires_in: 3600 }),
  });
  await h.run();
  expect(h.fetch).toHaveBeenCalledTimes(2);
  expect(h.fetch.mock.calls[1][1].headers.Authorization).toBe(
    "Bearer renewed-synthetic",
  );
  expect(h.events.event).toHaveBeenCalledWith("connected");
});

function addAudio(h: ReturnType<typeof sessionHarness>) {
  const audio = {
    src: "https://audio.test/synthetic.wav",
    duration: 10,
    currentTime: 0,
    paused: true,
    volume: 0,
    addEventListener: vi.fn(),
    play: vi.fn(async () => {
      audio.paused = false;
    }),
    pause: vi.fn(),
  };
  Object.assign(h.nodes, { "site-audio": audio });
  Object.assign(h.nodes["spotify-play"], {
    dataset: {},
    setAttribute: vi.fn(),
  });
  Object.assign(h.ctx.document.getElementById("spotify-previous"), {
    setAttribute: vi.fn(),
  });
  return audio;
}

it.each([false, true])(
  "preserves permitted audio and no-music recovery after token failure (refresh=%s)",
  async (refresh) => {
    const h = sessionHarness(true, refresh);
    const audio = addAudio(h);
    await h.run();
    expect(h.ctx.document.body.dataset).toMatchObject({
      playbackSource: "audio",
      playerVisible: "true",
    });
    expect(h.ctx.document.body.dataset).not.toHaveProperty("connected", "true");
    expect(h.nodes["spotify-status"]).toMatchObject({ hidden: false });
    expect(h.nodes["spotify-status"].textContent).toMatch(/reconnect/i);
    expect(h.nodes["spotify-skip"]).toMatchObject({ hidden: false });
    expect(h.nodes["spotify-play"]).toMatchObject({
      hidden: false,
      disabled: false,
    });
    expect(h.events.event).not.toHaveBeenCalledWith("connected");
    expect(h.head.appendChild).not.toHaveBeenCalled();
    await h.nodes["spotify-play"].onclick!();
    expect(audio.play).toHaveBeenCalledOnce();
  },
);

it("treats an explicit profile401 as recovery rather than a connected unknown subscription", async () => {
  const h = sessionHarness(false);
  h.fetch.mockResolvedValue({ ok: false, status: 401 });
  await h.run();
  expect(h.ctx.document.body.dataset).not.toHaveProperty("connected", "true");
  expect(h.nodes["spotify-status"]).toMatchObject({ hidden: false });
  expect(h.nodes["spotify-status"].textContent).toMatch(/reconnect/i);
  expect(h.events.event).not.toHaveBeenCalledWith("connected");
  expect(h.parent.postMessage).not.toHaveBeenCalled();
  expect(h.nodes["spotify-skip"]).toMatchObject({ hidden: false });
  expect(h.nodes["spotify-disconnect"]).toMatchObject({ hidden: false });
  expect(h.head.appendChild).not.toHaveBeenCalled();
  expect(h.fetch).toHaveBeenCalledTimes(1);
});

it("keeps profile network failure unknown for an otherwise valid session", async () => {
  const h = sessionHarness(false);
  h.fetch.mockRejectedValue(new TypeError("Failed to fetch"));
  await h.run();
  expect(h.ctx.document.body.dataset).toMatchObject({
    connected: "true",
    spotifyProduct: "unknown",
  });
  expect(h.events.event).toHaveBeenCalledWith("connected");
});

it("preserves permitted audio after a profile401 without announcing Spotify connection", async () => {
  const h = sessionHarness(false);
  const audio = addAudio(h);
  h.fetch.mockResolvedValue({ ok: false, status: 401 });
  await h.run();
  expect(h.ctx.document.body.dataset).toMatchObject({
    playbackSource: "audio",
  });
  expect(h.ctx.document.body.dataset).not.toHaveProperty("connected", "true");
  expect(h.nodes["spotify-status"].textContent).toContain("no longer valid");
  expect(h.nodes["spotify-skip"]).toMatchObject({ hidden: false });
  expect(h.events.event).not.toHaveBeenCalledWith("connected");
  await h.nodes["spotify-play"].onclick!();
  expect(audio.play).toHaveBeenCalledOnce();
});

it("does not grant listening-only audio eligibility from an expired session", async () => {
  const h = sessionHarness();
  Object.assign(h.ctx.document.body.dataset, {
    listeningOnly: "true",
    playerConfig: JSON.stringify({
      playerId: "release",
      sessionId: "session",
      spotify: { configured: true },
      freePlayback: "audio",
    }),
  });
  const audio = addAudio(h);
  await h.run();
  expect(h.ctx.document.body.dataset).not.toHaveProperty(
    "playbackSource",
    "audio",
  );
  expect(h.nodes["spotify-play"]).toMatchObject({ hidden: true });
  expect(audio.play).not.toHaveBeenCalled();
  expect(h.nodes["spotify-status"].textContent).toContain("expired");
});
