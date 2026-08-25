import { beforeEach, describe, expect, it, vi } from "vitest";
import { getChatRunStatus } from "@/lib/tasks/getChatRunStatus";

vi.mock("@/lib/consts", () => ({ NEW_API_BASE_URL: "https://api.test" }));

describe("getChatRunStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GETs /api/chat/runs/{runId} with the bearer token and returns the timing", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        runId: "wrun_abc",
        status: "completed",
        createdAt: "2026-08-25T19:33:56.000Z",
        startedAt: "2026-08-25T19:34:16.386Z",
        completedAt: "2026-08-25T20:15:55.000Z",
        durationMs: 2498614,
      }),
    }) as unknown as typeof fetch;

    const result = await getChatRunStatus("wrun_abc", "privy-token");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.test/api/chat/runs/wrun_abc",
      {
        method: "GET",
        headers: { Authorization: "Bearer privy-token" },
      },
    );
    expect(result).toEqual({
      status: "completed",
      createdAt: "2026-08-25T19:33:56.000Z",
      startedAt: "2026-08-25T19:34:16.386Z",
      completedAt: "2026-08-25T20:15:55.000Z",
      durationMs: 2498614,
    });
  });

  it("throws on a non-OK response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ status: "error", error: "Run not found" }),
    }) as unknown as typeof fetch;
    await expect(getChatRunStatus("wrun_missing", "t")).rejects.toThrow(
      "Run not found",
    );
  });
});
