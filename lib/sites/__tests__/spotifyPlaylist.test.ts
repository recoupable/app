import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";
import { renderSpotifyPlayer } from "../renderSpotifyPlayer";
import { spotifyRuntimeHarness } from "./fixtures/spotifyRuntimeHarness";

interface FixtureNode {
  hidden: boolean;
  textContent: string;
  disabled: boolean;
  dataset: Record<string, string>;
  children: FixtureNode[];
  appendChild(child: FixtureNode): void;
  replaceChildren(): void;
  setAttribute: ReturnType<typeof vi.fn>;
  removeAttribute: ReturnType<typeof vi.fn>;
  onclick?: () => Promise<void>;
}
interface PlaylistOptions {
  release: string;
  getToken: () => Promise<string>;
  start: (position: number) => Promise<void>;
}
interface PlaylistView {
  load(): Promise<void>;
  ready(value: boolean): void;
  current(id: string): void;
}

function setup(release = "https://open.spotify.com/playlist/abc") {
  const node = (): FixtureNode => ({
    hidden: true,
    textContent: "",
    disabled: false,
    dataset: {} as Record<string, string>,
    children: [],
    appendChild(child: FixtureNode) {
      this.children.push(child);
    },
    replaceChildren() {
      this.children = [];
    },
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
  });
  const nodes = Object.fromEntries(
    [
      "spotify-playlist",
      "spotify-playlist-title",
      "spotify-playlist-tracks",
      "spotify-playlist-status",
      "spotify-playlist-more",
    ].map((id) => [id, node()]),
  );
  const fetch = vi.fn();
  const window = {
    RecoupSpotifyPlaylist: null as unknown as {
      create(options: PlaylistOptions): PlaylistView;
    },
  };
  const document = {
    getElementById: (id: string) => nodes[id],
    createElement: node,
  };
  runInNewContext(readFileSync("public/spotify-playlist.js", "utf8"), {
    window,
    document,
    fetch,
    URL,
  });
  const start = vi.fn(async () => {}),
    token = vi.fn(async () => "private-token");
  const list = window.RecoupSpotifyPlaylist.create({
    release,
    getToken: token,
    start,
  });
  return { nodes, fetch, list, start, token };
}
const track = (id: string, name = id) => ({
  id,
  name,
  type: "track",
  duration_ms: 74000,
  artists: [{ name: "Artist" }],
  is_playable: true,
});
const response = (value: unknown) => ({ ok: true, json: async () => value });

it("renders a playlist surface and loads public playlist rows in original order", async () => {
  expect(
    renderSpotifyPlayer("https://open.spotify.com/playlist/abc", "", null),
  ).toContain('id="spotify-playlist-tracks"');
  const h = setup();
  h.fetch
    .mockResolvedValueOnce(response({ name: "Starter pack" }))
    .mockResolvedValueOnce(
      response({
        items: [
          { track: track("one", "<img onerror=bad>") },
          { track: null },
          { track: track("three") },
        ],
        offset: 0,
        total: 3,
        next: null,
      }),
    );
  await h.list.load();
  h.list.ready(true);
  expect(h.nodes["spotify-playlist-title"].textContent).toBe("Starter pack");
  expect(h.nodes["spotify-playlist-tracks"].children).toHaveLength(3);
  expect(
    h.nodes["spotify-playlist-tracks"].children[1].children[0].disabled,
  ).toBe(true);
  await h.nodes["spotify-playlist-tracks"].children[2].children[0].onclick!();
  expect(h.start).toHaveBeenCalledWith(2);
  h.list.current("three");
  expect(
    h.nodes["spotify-playlist-tracks"].children[2].children[0].setAttribute,
  ).toHaveBeenCalledWith("aria-current", "true");
  expect(h.fetch.mock.calls[1][0]).toBe(
    "https://api.spotify.com/v1/playlists/abc/tracks?limit=50&offset=0",
  );
});
it("paginates without following untrusted next URLs and preserves duplicate positions", async () => {
  const h = setup();
  h.fetch
    .mockResolvedValueOnce(response({ name: "Playlist" }))
    .mockResolvedValueOnce(
      response({
        items: [{ track: track("same") }],
        offset: 0,
        total: 2,
        next: "https://evil.test",
      }),
    )
    .mockResolvedValueOnce(
      response({
        items: [{ track: track("same") }],
        offset: 1,
        total: 2,
        next: null,
      }),
    );
  await h.list.load();
  h.list.ready(true);
  h.list.current("same");
  await h.nodes["spotify-playlist-more"].onclick!();
  const first = h.nodes["spotify-playlist-tracks"].children[0].children[0];
  const second = h.nodes["spotify-playlist-tracks"].children[1].children[0];
  expect(first.setAttribute).toHaveBeenCalledWith("aria-current", "true");
  expect(second.setAttribute).not.toHaveBeenCalledWith("aria-current", "true");
  first.setAttribute.mockClear();
  second.setAttribute.mockClear();
  await h.nodes["spotify-playlist-tracks"].children[1].children[0].onclick!();
  h.list.current("same");
  expect(first.setAttribute).not.toHaveBeenCalledWith("aria-current", "true");
  expect(second.setAttribute).toHaveBeenCalledWith("aria-current", "true");
  expect(h.start).toHaveBeenCalledWith(1);
  expect(h.fetch.mock.calls[2][0]).toBe(
    "https://api.spotify.com/v1/playlists/abc/tracks?limit=50&offset=1",
  );
});
it("keeps list failure local and does not fetch for single-song destinations", async () => {
  const h = setup();
  h.fetch.mockResolvedValue({ ok: false, status: 403 });
  await h.list.load();
  expect(h.nodes["spotify-playlist-status"].textContent).toContain(
    "Open in Spotify",
  );
  expect(h.start).not.toHaveBeenCalled();
  const single = setup("https://open.spotify.com/track/abc");
  await single.list.load();
  expect(single.fetch).not.toHaveBeenCalled();
  expect(single.nodes["spotify-playlist"].hidden).toBe(true);
});
it("requires a ready device and displays selection errors without claiming playback", async () => {
  const h = setup();
  h.fetch
    .mockResolvedValueOnce(response({ name: "Playlist" }))
    .mockResolvedValueOnce(
      response({ items: [{ track: track("one") }], offset: 0, total: 1 }),
    );
  await h.list.load();
  const button = h.nodes["spotify-playlist-tracks"].children[0].children[0];
  expect(button.disabled).toBe(true);
  h.list.ready(true);
  h.start.mockRejectedValueOnce(new Error("Playback unavailable"));
  await button.onclick!();
  expect(h.nodes["spotify-playlist-status"].textContent).toBe(
    "Playback unavailable",
  );
  expect(button.setAttribute).not.toHaveBeenCalledWith("aria-current", "true");
});

it("starts a selected row inside the original playlist context using its absolute offset", async () => {
  const h = spotifyRuntimeHarness(false);
  Object.assign(h.ctx.document.body.dataset, {
    release: "https://open.spotify.com/playlist/abc",
  });
  h.storage.set(
    "recoup-sites-spotify",
    JSON.stringify({ access_token: "fake", expiresAt: Date.now() + 3600000 }),
  );
  h.fetch.mockImplementation(async (url: string) =>
    response(
      url.includes("/v1/me/player/play")
        ? {}
        : url.includes("/v1/me")
          ? { product: "premium" }
          : { configured: true },
    ),
  );
  const listeners: Record<string, (value?: { device_id: string }) => void> = {};
  const sdk = {
    addListener: vi.fn((name, fn) => {
      listeners[name] = fn;
    }),
    connect: vi.fn(async () => true),
    activateElement: vi.fn(async () => {}),
    setVolume: vi.fn(),
    seek: vi.fn(),
    togglePlay: vi.fn(),
  };
  let options: PlaylistOptions | undefined;
  const view = { load: vi.fn(), ready: vi.fn(), current: vi.fn() };
  const runtimeWindow = Object.assign(h.ctx.window, {
    onSpotifyWebPlaybackSDKReady: undefined as (() => void) | undefined,
    Spotify: {
      Player: function () {
        return sdk;
      },
    },
    RecoupSpotifyPlaylist: {
      create: vi.fn((value: PlaylistOptions) => {
        options = value;
        return view;
      }),
    },
  });
  Object.assign(h.ctx.document, { head: { appendChild: vi.fn() } });
  Object.assign(h.ctx, { setInterval: vi.fn() });
  await h.run();
  runtimeWindow.onSpotifyWebPlaybackSDKReady!();
  listeners.ready({ device_id: "device" });
  await options!.start(7);
  const call = h.fetch.mock.calls.find(([url]) =>
    url.includes("/v1/me/player/play"),
  )!;
  expect(JSON.parse(call[1].body)).toEqual({
    context_uri: "spotify:playlist:abc",
    offset: { position: 7 },
  });
  expect(call[0]).toContain("device_id=device");
  expect(view.ready).toHaveBeenCalledWith(true);
  listeners.not_ready();
  expect(view.ready).toHaveBeenLastCalledWith(false);
});
