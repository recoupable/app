import { describe, it, expect, vi } from "vitest";
import { getTaskRunStatus } from "@/lib/tasks/getTaskRunStatus";

describe("getTaskRunStatus", () => {
  it("requests run status with runId and account_id override", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "success",
        runs: [
          {
            status: "COMPLETED",
            output: { ok: true },
            metadata: { step: "done" },
            taskIdentifier: "task-1",
            createdAt: "2026-01-01T00:00:00.000Z",
            startedAt: "2026-01-01T00:00:01.000Z",
            finishedAt: "2026-01-01T00:00:02.000Z",
            durationMs: 1000,
          },
        ],
      }),
    }) as unknown as typeof fetch;

    const result = await getTaskRunStatus("run_123", "token-123", { accountIdOverride: "acc_456" });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/tasks/runs?runId=run_123&account_id=acc_456"),
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer token-123" },
      }),
    );
    expect(result.status).toBe("COMPLETED");
  });

  it("sends empty bearer when token is null and surfaces API error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ status: "error", error: "Unauthorized" }),
    }) as unknown as typeof fetch;

    await expect(getTaskRunStatus("run_123", null)).rejects.toThrow("Unauthorized");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/tasks/runs?runId=run_123"),
      expect.objectContaining({
        headers: { Authorization: "Bearer " },
      }),
    );
  });
});
