import { describe, expect, it, vi } from "vitest";
import { createNoContentAwareFetch } from "@/lib/chat/createNoContentAwareFetch";

describe("createNoContentAwareFetch", () => {
  // The bug: a 204 is ok:true with a non-null empty ReadableStream, so the
  // resume loop's `!res.ok || !res.body` guard never fires and it re-requests
  // forever. Verified live on the preview 2026-09-02.
  it("nulls the body of a 204 so the caller's !res.body guard fires", async () => {
    const inner = vi.fn(async () => new Response(new ReadableStream(), { status: 200 }));
    // Simulate what the browser actually returns for a 204.
    const fake = Object.create(Response.prototype);
    Object.defineProperties(fake, {
      status: { value: 204 },
      ok: { value: true },
      body: { value: new ReadableStream() },
      statusText: { value: "No Content" },
      headers: { value: new Headers() },
    });
    inner.mockResolvedValueOnce(fake as Response);

    const wrapped = createNoContentAwareFetch(inner as unknown as typeof fetch);
    const res = await wrapped("https://example.com/stream");

    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
  });

  it("passes every other response through untouched", async () => {
    const original = new Response("hello", { status: 200 });
    const inner = vi.fn(async () => original);
    const wrapped = createNoContentAwareFetch(inner as unknown as typeof fetch);

    await expect(wrapped("https://example.com")).resolves.toBe(original);
  });

  it("does not swallow an error status", async () => {
    const inner = vi.fn(async () => new Response("nope", { status: 500 }));
    const wrapped = createNoContentAwareFetch(inner as unknown as typeof fetch);
    const res = await wrapped("https://example.com");

    expect(res.status).toBe(500);
    expect(res.body).not.toBeNull();
  });
});
