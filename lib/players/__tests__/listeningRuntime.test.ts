import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";
const source = readFileSync("public/release-player-runtime.js", "utf8");
it("reports track-linked active listening and excludes paused time without leaking identity", async () => {
  let now = 1000;
  const fetch = vi.fn().mockResolvedValue({ ok: true });
  const handlers: Record<string, () => void> = {};
  const ctx = {
    document: {
      body: {
        dataset: {
          playerConfig: JSON.stringify({ flow: "signed", provider: "spotify" }),
        },
      },
      addEventListener: vi.fn(),
    },
    window: {
      addEventListener: (event: string, fn: () => void) => {
        handlers[event] = fn;
      },
    },
    Date: { now: () => now },
    crypto: { randomUUID: () => crypto.randomUUID() },
    fetch,
    setInterval: vi.fn(),
  };
  runInNewContext(source, ctx);
  const runtime = (
    ctx.window as unknown as {
      RecoupReleasePlayer: {
        state: (track: string, paused: boolean, position: number) => void;
        event: (event: string) => void;
      };
    }
  ).RecoupReleasePlayer;
  runtime.state("track1", false, 0);
  now += 5000;
  runtime.state("track1", true, 5000);
  now += 10000;
  runtime.state("track1", false, 5000);
  now += 2000;
  runtime.event("skip");
  await new Promise((resolve) => setTimeout(resolve, 0));
  const reports = fetch.mock.calls.map((call) => JSON.parse(call[1].body));
  expect(
    reports.reduce(
      (total: number, row: { event: { listenedMs: number } }) =>
        total + row.event.listenedMs,
      0,
    ),
  ).toBe(7000);
  expect(
    reports.some(
      (row) => row.event.event === "skip" && row.event.trackId === "track1",
    ),
  ).toBe(true);
  expect(JSON.stringify(reports)).not.toContain("email");
  expect(JSON.stringify(reports)).not.toContain("access_token");
});
it("does nothing on legacy Sites without a registered player session", () => {
  const fetch = vi.fn(),
    window = {};
  runInNewContext(source, {
    document: { body: { dataset: {} } },
    window,
    fetch,
  });
  expect(window).not.toHaveProperty("RecoupReleasePlayer");
  expect(fetch).not.toHaveBeenCalled();
});

it("excludes uploaded-file playback from DSP listening reports", async () => {
  const fetch = vi.fn();
  const ctx = {
    document: {
      body: {
        dataset: {
          playerConfig: JSON.stringify({ flow: "signed", provider: "spotify" }),
          playbackSource: "audio",
        },
      },
    },
    window: { addEventListener: vi.fn() },
    Date,
    crypto,
    fetch,
    setInterval: vi.fn(),
  };
  runInNewContext(source, ctx);
  const runtime = (
    ctx.window as unknown as {
      RecoupReleasePlayer: {
        state: (track: string, paused: boolean, position: number) => void;
        event: (event: string) => void;
      };
    }
  ).RecoupReleasePlayer;
  runtime.state("file", false, 0);
  runtime.event("heartbeat");
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(fetch).not.toHaveBeenCalled();
});
