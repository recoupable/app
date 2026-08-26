import { describe, expect, it } from "vitest";
import { getRunPageState } from "@/lib/tasks/getRunPageState";
import type { TaskRunStatus } from "@/lib/tasks/getTaskRunStatus";

const triggerRun: TaskRunStatus = {
  status: "COMPLETED",
  metadata: {
    sessionId: "sess-1",
    chatId: "chat-1",
    workflowRunId: "wrun_abc",
  },
  taskIdentifier: "customer-prompt-task",
  createdAt: "2026-08-25T19:33:00.000Z",
  startedAt: "2026-08-25T19:33:10.000Z",
  finishedAt: "2026-08-25T19:33:40.000Z",
  durationMs: 30000,
};

const workflow = {
  status: "completed" as const,
  createdAt: "2026-08-25T19:33:56.000Z",
  startedAt: "2026-08-25T19:34:16.386Z",
  completedAt: "2026-08-25T20:15:55.000Z",
  durationMs: 2498614,
};

describe("getRunPageState", () => {
  it("renders the workflow's status and timeline, fired-at from the Trigger run, and the chat link", () => {
    expect(getRunPageState({ triggerRun, workflow })).toEqual({
      view: "linked",
      statusKey: "COMPLETED",
      firedAt: "2026-08-25T19:33:00.000Z",
      startedAt: "2026-08-25T19:34:16.386Z",
      finishedAt: "2026-08-25T20:15:55.000Z",
      durationMs: 2498614,
      chatHref: "/sessions/sess-1/chats/chat-1",
    });
  });

  it("maps workflow statuses onto the existing status config keys", () => {
    for (const [status, key] of [
      ["queued", "QUEUED"],
      ["running", "EXECUTING"],
      ["failed", "FAILED"],
      ["cancelled", "CANCELED"],
    ] as const) {
      const state = getRunPageState({
        triggerRun,
        workflow: { ...workflow, status },
      });
      expect(state.view === "linked" && state.statusKey).toBe(key);
    }
  });

  it("is 'loading' while the link exists but the workflow status has not arrived", () => {
    expect(getRunPageState({ triggerRun, workflow: undefined })).toEqual({
      view: "loading",
    });
  });

  it("degrades to 'unlinked' with the Trigger run's own status and timings for runs fired before the link existed", () => {
    expect(
      getRunPageState({
        triggerRun: { ...triggerRun, metadata: null },
        workflow: undefined,
      }),
    ).toEqual({
      view: "unlinked",
      statusKey: "COMPLETED",
      firedAt: "2026-08-25T19:33:00.000Z",
      startedAt: "2026-08-25T19:33:10.000Z",
      finishedAt: "2026-08-25T19:33:40.000Z",
      durationMs: 30000,
    });
  });

  it("is 'unavailable' when the link exists but the workflow status fetch failed, keeping the chat link", () => {
    expect(
      getRunPageState({
        triggerRun,
        workflow: undefined,
        workflowFailed: true,
      }),
    ).toEqual({
      view: "unavailable",
      firedAt: "2026-08-25T19:33:00.000Z",
      chatHref: "/sessions/sess-1/chats/chat-1",
    });
  });
});
