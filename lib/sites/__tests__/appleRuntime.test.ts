import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";
const source = readFileSync("public/sites-apple-runtime.js", "utf8");
it("never loads MusicKit or enables sign-in when config is unavailable", async () => {
  const nodes: Record<string, { textContent?: string; disabled?: boolean }> = {
    "apple-connect": { disabled: true },
    "apple-status": {},
  };
  const appendChild = vi.fn();
  const ctx = {
    document: {
      body: { hasAttribute: () => true, dataset: {} },
      getElementById: (id: string) => nodes[id],
      head: { appendChild },
    },
    fetch: vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ configured: false }),
    }),
  };
  await runInNewContext(source, ctx);
  expect(nodes["apple-connect"].disabled).toBe(true);
  expect(nodes["apple-status"].textContent).toContain("unavailable");
  expect(appendChild).not.toHaveBeenCalled();
});
it("authorizes before queueing and never sends the Music User Token to the external artist website", async () => {
  const nodes: Record<
    string,
    {
      disabled?: boolean;
      hidden?: boolean;
      textContent?: string;
      onclick?: () => Promise<void>;
    }
  > = {};
  const handlers: Record<string, () => void> = {};
  const reporter = { state: vi.fn(), event: vi.fn() };
  const music = {
    nowPlayingItem: { id: "song1", title: "Track" },
    playbackState: 2,
    currentPlaybackTime: 12,
    addEventListener: vi.fn((event: string, handler: () => void) => {
      handlers[event] = handler;
    }),
    authorize: vi.fn().mockResolvedValue("private-token"),
    setQueue: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    unauthorize: vi.fn(),
  };
  let loaded: () => Promise<void> = async () => {};
  const postMessage = vi.fn();
  const ctx = {
    document: {
      body: {
        hasAttribute: () => true,
        dataset: {
          playerParent: "https://artist.example",
          releaseKind: "album",
          releaseId: "123",
        },
      },
      getElementById: (id: string) => (nodes[id] ||= {}),
      addEventListener: (_: string, fn: () => Promise<void>) => {
        loaded = fn;
      },
      createElement: () => ({}),
      head: { appendChild: vi.fn() },
    },
    window: {
      parent: { postMessage },
      RecoupReleasePlayer: reporter,
      MusicKit: {
        configure: vi.fn(),
        getInstance: () => music,
        Events: {
          playbackStateDidChange: "state",
          nowPlayingItemDidChange: "track",
        },
        PlaybackStates: {
          playing: 2,
          paused: 3,
          stopped: 4,
          ended: 5,
          completed: 6,
        },
      },
    },
    fetch: vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        configured: true,
        developerToken: "browser-token",
      }),
    }),
  };
  await runInNewContext(source, ctx);
  await loaded();
  expect(music.setQueue).not.toHaveBeenCalled();
  await nodes["apple-connect"].onclick!();
  expect(music.authorize).toHaveBeenCalledOnce();
  expect(music.authorize.mock.invocationCallOrder[0]).toBeLessThan(
    music.setQueue.mock.invocationCallOrder[0],
  );
  expect(music.setQueue).toHaveBeenCalledWith({ album: "123" });
  expect(postMessage).toHaveBeenCalledWith(
    { type: "recoup:playback", provider: "apple_music", event: "connected" },
    "https://artist.example",
  );
  expect(JSON.stringify(postMessage.mock.calls)).not.toContain("private-token");
  expect(music.play).not.toHaveBeenCalled();
  expect(reporter.event).toHaveBeenCalledWith("connected");
  handlers.state();
  expect(reporter.state).toHaveBeenLastCalledWith("song1", false, 12000);
  music.playbackState = 3;
  handlers.state();
  expect(reporter.state).toHaveBeenLastCalledWith("song1", true, 12000);
  music.nowPlayingItem = { id: "song2", title: "Next" };
  handlers.track();
  expect(reporter.state).toHaveBeenLastCalledWith("song2", true, 12000);
  music.playbackState = 4;
  handlers.state();
  expect(reporter.state).toHaveBeenLastCalledWith(
    "song2",
    true,
    12000,
    "stopped",
  );
});
