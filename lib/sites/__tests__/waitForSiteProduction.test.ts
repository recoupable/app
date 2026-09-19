import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { waitForSiteProduction } from "../waitForSiteProduction";
import type { Site } from "../schema";
const values = new Map<string, string>();
beforeEach(() => {
  values.clear();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("polls the existing job without starting new paid generation", async () => {
  vi.useFakeTimers();
  const site = { id: "site" } as Site;
  const request = vi
    .fn()
    .mockResolvedValueOnce({ generation: { status: "running" } })
    .mockResolvedValueOnce({ generation: { status: "completed" }, site });
  const result = waitForSiteProduction(request, "site", {
    generation: { token: "job", status: "running" },
  });
  await vi.advanceTimersByTimeAsync(4000);
  expect(await result).toEqual({ site });
  expect(request).toHaveBeenCalledTimes(2);
  for (const call of request.mock.calls)
    expect(JSON.parse(call[1].body)).toEqual({
      action: "generation",
      token: "job",
    });
  expect(values.size).toBe(0);
});
it("removes failed jobs and surfaces the server's error", async () => {
  const request = vi
    .fn()
    .mockResolvedValue({
      generation: { status: "failed" },
      error: "Build stopped",
    });
  await expect(
    waitForSiteProduction(request, "site", {
      generation: { token: "job", status: "running" },
    }),
  ).rejects.toThrow("Build stopped");
  expect(values.size).toBe(0);
});
it("keeps the token after a network failure so a refresh can resume", async () => {
  const request = vi.fn().mockRejectedValue(new Error("offline"));
  await expect(
    waitForSiteProduction(request, "site", {
      generation: { token: "job", status: "running" },
    }),
  ).rejects.toThrow("offline");
  expect(values.get("site-production:site")).toBe("job");
});
