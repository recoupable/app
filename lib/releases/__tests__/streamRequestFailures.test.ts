import { afterEach, expect, it, vi } from "vitest";
import { requestStreamData } from "../requestStreamData";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it.each(["transport", "json"])("sanitizes %s failures", async (kind) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      if (kind === "transport") throw new Error("private internal address");
      return new Response("private malformed payload");
    }),
  );
  await expect(
    requestStreamData(
      "catalogs/a/streams",
      async () => "viewer",
      new AbortController().signal,
    ),
  ).rejects.toThrow("Could not load streams. Please retry.");
});
it("cancels an in-flight request with its caller and releases its timeout", async () => {
  vi.useFakeTimers();
  const controller = new AbortController();
  let requestSignal!: AbortSignal;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (_url, options) =>
        new Promise<Response>((_, reject) => {
          requestSignal = options.signal;
          requestSignal.addEventListener("abort", () =>
            reject(requestSignal.reason),
          );
        }),
    ),
  );
  const pending = requestStreamData(
    "catalogs/a/streams",
    async () => "viewer",
    controller.signal,
  );
  const assertion = expect(pending).rejects.toThrow("cancelled");
  await vi.advanceTimersByTimeAsync(0);
  controller.abort(new Error("cancelled"));
  await assertion;
  expect(requestSignal.aborted).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});
it("times out a stalled transport with a safe retry message", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (_url, options) =>
        new Promise<Response>((_, reject) => {
          options.signal.addEventListener("abort", () =>
            reject(options.signal.reason),
          );
        }),
    ),
  );
  const pending = requestStreamData(
    "catalogs/a/streams",
    async () => "viewer",
    new AbortController().signal,
  );
  const assertion = expect(pending).rejects.toThrow(
    "Could not load streams. Please retry.",
  );
  await vi.advanceTimersByTimeAsync(30000);
  await assertion;
  expect(vi.getTimerCount()).toBe(0);
});

it("rejects a successful HTTP response carrying an error envelope", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({ status: "error", error: "private provider details" }),
    ),
  );
  await expect(
    requestStreamData(
      "catalogs/a/stream-tracking",
      async () => "viewer",
      new AbortController().signal,
      { action: "enable" },
    ),
  ).rejects.toThrow("Could not load streams. Please retry.");
});
