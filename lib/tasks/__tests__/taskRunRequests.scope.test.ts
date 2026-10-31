import { afterEach, describe, expect, it, vi } from "vitest";
import { getTaskRuns } from "../getTaskRuns";
import { getTaskRunStatus } from "../getTaskRunStatus";
import { getChatRunStatus } from "../getChatRunStatus";
const state = vi.hoisted(() => ({ origin: "https://selected.example.test" }));
vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => state.origin,
}));
afterEach(() => vi.unstubAllGlobals());

describe("run request context", () => {
  it.each(["list", "detail", "workflow"] as const)(
    "%s captures the dynamic origin and propagates cancellation",
    async (kind) => {
      const signal = new AbortController().signal;
      const fetchMock = vi
        .fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            runs: [
              {
                status: "COMPLETED",
                metadata: { workflowRunId: "workflow-a" },
              },
            ],
            status: "completed",
          }),
        });
      vi.stubGlobal("fetch", fetchMock);
      if (kind === "list")
        await getTaskRuns("token", { accountIdOverride: "target", signal });
      else if (kind === "detail")
        await getTaskRunStatus("run-a", "token", {
          accountIdOverride: "target",
          signal,
        });
      else await getChatRunStatus("workflow-a", "token", { signal });
      const [href, options] = fetchMock.mock.calls[0];
      const url = new URL(href);
      expect(url.origin).toBe(state.origin);
      expect(options.signal).toBe(signal);
      expect(options.headers.Authorization).toBe("Bearer token");
      if (kind === "workflow")
        expect(url.searchParams.has("account_id")).toBe(false);
      else expect(url.searchParams.get("account_id")).toBe("target");
      if (kind === "detail")
        expect(url.searchParams.get("runId")).toBe("run-a");
      if (kind === "list") expect(url.searchParams.get("limit")).toBe("20");
    },
  );
  it("keeps kickoff metadata while a run is unfinished", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            runs: [
              {
                status: "EXECUTING",
                metadata: {
                  workflowRunId: "workflow-a",
                  sessionId: "session-a",
                  chatId: "chat-a",
                },
                durationMs: 22,
              },
            ],
          }),
        }),
    );
    const run = await getTaskRunStatus("run-a", "token");
    expect(run.metadata).toEqual({
      workflowRunId: "workflow-a",
      sessionId: "session-a",
      chatId: "chat-a",
    });
    expect(run.durationMs).toBeNull();
  });
});
