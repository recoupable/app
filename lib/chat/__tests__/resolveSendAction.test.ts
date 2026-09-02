import { describe, expect, it } from "vitest";
import { resolveSendAction } from "@/lib/chat/resolveSendAction";

const base = {
  isGeneratingResponse: false,
  hasContent: true,
  hasPendingUploads: false,
  isLoadingSignedUrls: false,
  workspaceReady: true,
};

describe("resolveSendAction", () => {
  it("sends when everything is ready", () => {
    expect(resolveSendAction(base)).toBe("send");
  });

  it("stops a run in progress before anything else", () => {
    expect(resolveSendAction({ ...base, isGeneratingResponse: true, hasContent: false })).toBe("stop");
  });

  // app#2052: the composer used to be dead until the sandbox finished
  // provisioning, so a first-time user typed, could not send, and left.
  it("queues instead of dropping when only the workspace is not ready", () => {
    expect(resolveSendAction({ ...base, workspaceReady: false })).toBe("queue");
  });

  it("does not queue an empty message", () => {
    expect(resolveSendAction({ ...base, workspaceReady: false, hasContent: false })).toBe("ignore");
  });

  it("does not queue while attachments are still uploading", () => {
    expect(resolveSendAction({ ...base, workspaceReady: false, hasPendingUploads: true })).toBe("ignore");
    expect(resolveSendAction({ ...base, workspaceReady: false, isLoadingSignedUrls: true })).toBe("ignore");
  });

  it("ignores an empty message when the workspace is ready", () => {
    expect(resolveSendAction({ ...base, hasContent: false })).toBe("ignore");
  });
});
