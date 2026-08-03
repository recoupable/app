import { describe, it, expect, vi } from "vitest";
import { createChunkCountingFetch } from "@/lib/chat/createChunkCountingFetch";

const BASE = "https://api.test";

function sseResponse(lines: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(lines.join("\n") + "\n"));
      controller.close();
    },
  });
  return new Response(body, { status: 200 });
}

/** Let the background counter drain the teed stream. */
const flush = () => new Promise(resolve => setTimeout(resolve, 20));

describe("createChunkCountingFetch", () => {
  it("counts SSE frames and reports the absolute index of the last one", async () => {
    const positions: (number | null)[] = [];
    const inner = vi.fn(async () =>
      sseResponse(['data: {"type":"start"}', 'data: {"type":"text-delta"}', "data: [DONE]"]),
    );

    const f = createChunkCountingFetch({ baseUrl: BASE, onPosition: p => positions.push(p), fetchImpl: inner });
    await f(`${BASE}/api/chat`, { method: "POST" });
    await flush();

    // Two real frames at indices 0 and 1; `[DONE]` is the terminator, not a chunk.
    expect(positions.at(-1)).toBe(1);
  });

  it("seeds the count from the request's own startIndex", async () => {
    const positions: (number | null)[] = [];
    const inner = vi.fn(async () => sseResponse(['data: {"a":1}', 'data: {"a":2}']));

    const f = createChunkCountingFetch({ baseUrl: BASE, onPosition: p => positions.push(p), fetchImpl: inner });
    await f(`${BASE}/api/chat/abc/stream?startIndex=348`);
    await flush();

    // Resumed at 348, received two frames → 348 and 349.
    expect(positions.at(-1)).toBe(349);
  });

  // Without this, a stale index from a previous turn or a different chat is
  // sent on the next reconnect and the resume skips chunks it never saw.
  it("resets the position when a read starts from the beginning", async () => {
    const positions: (number | null)[] = [];
    const inner = vi.fn(async () => sseResponse(['data: {"a":1}']));

    const f = createChunkCountingFetch({ baseUrl: BASE, onPosition: p => positions.push(p), fetchImpl: inner });
    await f(`${BASE}/api/chat`, { method: "POST" });

    // Reset is reported synchronously, before any frame arrives — that is the
    // window a reconnect could otherwise fire in.
    expect(positions[0]).toBeNull();
  });

  it("does NOT reset when the read is itself a resume", async () => {
    const positions: (number | null)[] = [];
    const inner = vi.fn(async () => sseResponse(['data: {"a":1}']));

    const f = createChunkCountingFetch({ baseUrl: BASE, onPosition: p => positions.push(p), fetchImpl: inner });
    await f(`${BASE}/api/chat/abc/stream?startIndex=10`);

    expect(positions[0]).not.toBeNull();
  });

  it("passes the body through to the caller unchanged", async () => {
    const inner = vi.fn(async () => sseResponse(['data: {"type":"start"}', "data: [DONE]"]));

    const f = createChunkCountingFetch({ baseUrl: BASE, onPosition: () => {}, fetchImpl: inner });
    const res = await f(`${BASE}/api/chat`, { method: "POST" });
    const text = await res.text();

    expect(text).toContain('data: {"type":"start"}');
    expect(text).toContain("data: [DONE]");
  });

  it("returns a bodyless response untouched", async () => {
    const inner = vi.fn(async () => new Response(null, { status: 204 }));

    const f = createChunkCountingFetch({ baseUrl: BASE, onPosition: () => {}, fetchImpl: inner });
    const res = await f(`${BASE}/api/chat/abc/stream`);

    expect(res.status).toBe(204);
  });
});
