import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/intelligent-ui/playground/route";
import { applySurfaceEvent } from "../../applySurfaceEvent";
import { parseSurfaceStream } from "../../parseSurfaceStream";
import type { Surface, SurfaceEvent } from "../../schema";
import { createExampleStream } from "../createExampleStream";
import { playgroundScenarios } from "../scenarios";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

const expectedComponents: Record<string, string[]> = {
  release: ["checklist", "collection", "metrics", "summary"],
  sourcing: ["checklist", "collection", "metrics", "summary"],
  supplier: [],
  listening: ["distribution"],
  song: ["timeline"],
};

describe("synthetic example streams", () => {
  it.each(playgroundScenarios)(
    "validates every revision in $id",
    async (scenario) => {
      const stream = createExampleStream(
        scenario.events,
        new AbortController().signal,
        0,
      );
      let surface: Surface | null = null;
      const events: SurfaceEvent[] = [];
      for await (const event of parseSurfaceStream(stream)) {
        events.push(event);
        surface = applySurfaceEvent(surface, event);
      }
      expect(events).toEqual(scenario.events);
      expect(surface?.revision).toBe(2);
      expect(surface?.components.map((item) => item.type).sort()).toEqual(
        expectedComponents[scenario.id],
      );
      if (["supplier", "listening", "song"].includes(scenario.id)) {
        expect(surface?.answer?.revision).toBe(surface?.revision);
        expect(surface?.answer?.parts.length).toBeGreaterThan(1);
      }
      expect(surface?.fallbackText).toContain("Synthetic");
      expect(
        surface?.evidence.every((item) =>
          item.text.startsWith("SYNTHETIC EXAMPLE."),
        ),
      ).toBe(true);
    },
  );

  it("closes immediately for an already aborted request", async () => {
    const abort = new AbortController();
    abort.abort();
    const stream = createExampleStream(
      playgroundScenarios[0].events,
      abort.signal,
    );
    expect(await stream.getReader().read()).toEqual({
      done: true,
      value: undefined,
    });
  });

  it("aborting a paced stream unblocks the reader and clears timers", async () => {
    vi.useFakeTimers();
    const abort = new AbortController();
    const reader = createExampleStream(
      playgroundScenarios[0].events,
      abort.signal,
    ).getReader();
    await reader.read();
    const pending = reader.read();
    abort.abort();
    expect(await pending).toEqual({ done: true, value: undefined });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("consumer cancellation during pacing clears timers without enqueueing", async () => {
    vi.useFakeTimers();
    const reader = createExampleStream(
      playgroundScenarios[0].events,
      new AbortController().signal,
    ).getReader();
    await reader.read();
    const pending = reader.read();
    await reader.cancel();
    expect(await pending).toEqual({ done: true, value: undefined });
    await vi.runAllTimersAsync();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("fixture endpoint", () => {
  it("denies production even when the opt-in flag is set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("RECOUP_INTELLIGENT_UI_PLAYGROUND", "true");
    expect(
      GET(
        new Request(
          "http://localhost/api/intelligent-ui/playground?scenario=release",
        ),
      ).status,
    ).toBe(404);
  });

  it("does not accept a tool, arbitrary subject, or unknown example", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "");
    for (const query of [
      "",
      "?scenario=send_email",
      "?scenario=https://example.com",
      "?subject=customer",
    ]) {
      expect(
        GET(
          new Request(`http://localhost/api/intelligent-ui/playground${query}`),
        ).status,
      ).toBe(400);
    }
  });

  it("serves a no-store NDJSON snapshot without service credentials", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "");
    const abort = new AbortController();
    const response = GET(
      new Request(
        "http://localhost/api/intelligent-ui/playground?scenario=release",
        { signal: abort.signal },
      ),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain(
      "application/x-ndjson",
    );
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    const reader = response.body!.getReader();
    const first = await reader.read();
    expect(JSON.parse(new TextDecoder().decode(first.value))).toEqual(
      playgroundScenarios[0].events[0],
    );
    await reader.cancel();
  });
});
