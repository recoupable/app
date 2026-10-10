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
it("authorizes before queueing and never sends the Music User Token to Gatsby", async () => {
  const nodes: Record<
    string,
    {
      disabled?: boolean;
      hidden?: boolean;
      textContent?: string;
      onclick?: () => Promise<void>;
    }
  > = {};
  const music = {
    addEventListener: vi.fn(),
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
          playerParent: "https://www.gatsby.wtf",
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
      MusicKit: {
        configure: vi.fn(),
        getInstance: () => music,
        Events: {},
        PlaybackStates: {},
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
  expect(music.setQueue).toHaveBeenCalledWith({ album: "123" });
  expect(postMessage).toHaveBeenCalledWith(
    { type: "recoup:playback", provider: "apple_music", event: "connected" },
    "https://www.gatsby.wtf",
  );
  expect(JSON.stringify(postMessage.mock.calls)).not.toContain("private-token");
  expect(music.play).not.toHaveBeenCalled();
});
