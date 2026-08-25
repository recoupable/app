import { describe, expect, it } from "vitest";
import { getRunWorkflowLink } from "@/lib/tasks/getRunWorkflowLink";

// api writes { sessionId, chatId, workflowRunId } onto the Trigger run's
// metadata when a scheduled task kicks off a workflow (chat#2006 item 4a).
describe("getRunWorkflowLink", () => {
  it("reads the three ids from the run metadata", () => {
    expect(
      getRunWorkflowLink({
        sessionId: "sess-1",
        chatId: "chat-1",
        workflowRunId: "wrun_abc",
      }),
    ).toEqual({
      sessionId: "sess-1",
      chatId: "chat-1",
      workflowRunId: "wrun_abc",
    });
  });

  it("is null when the run predates the link or any id is missing", () => {
    expect(getRunWorkflowLink(null)).toBeNull();
    expect(getRunWorkflowLink(undefined)).toBeNull();
    expect(getRunWorkflowLink({})).toBeNull();
    expect(
      getRunWorkflowLink({ chatId: "chat-1", workflowRunId: "wrun_abc" }),
    ).toBeNull();
    expect(
      getRunWorkflowLink({ sessionId: 1, chatId: "c", workflowRunId: "w" }),
    ).toBeNull();
  });
});
