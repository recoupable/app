import { describe, it, expect } from "vitest";
import { shouldSendPendingMessage } from "@/lib/chat/shouldSendPendingMessage";

const ready = {
  hasPendingMessage: true,
  status: "ready",
  messagesLength: 0,
  userId: "acct-1",
  authenticated: true,
  sessionId: "sess-1",
  workspaceReady: true,
};

describe("shouldSendPendingMessage", () => {
  it("sends when authenticated, ready, and the session is provisioned", () => {
    expect(shouldSendPendingMessage(ready)).toBe(true);
  });

  it("does NOT send while the bootstrap session is still provisioning (chat#1847)", () => {
    expect(
      shouldSendPendingMessage({ ...ready, sessionId: undefined }),
    ).toBe(false);
  });

  it("does not send when nothing is pending", () => {
    expect(
      shouldSendPendingMessage({ ...ready, hasPendingMessage: false }),
    ).toBe(false);
  });

  it("does not send while the chat transport is busy", () => {
    expect(
      shouldSendPendingMessage({ ...ready, status: "streaming" }),
    ).toBe(false);
  });

  it("does not re-send once the conversation has messages", () => {
    expect(shouldSendPendingMessage({ ...ready, messagesLength: 2 })).toBe(
      false,
    );
  });

  it("does not send before login completes", () => {
    expect(shouldSendPendingMessage({ ...ready, userId: undefined })).toBe(
      false,
    );
    expect(
      shouldSendPendingMessage({ ...ready, authenticated: false }),
    ).toBe(false);
  });

  // app#2052: a Send pressed before the workspace was ready is the same
  // pending state as a ?q= prefill, and waits on the same sessionId.
  it("holds an armed manual send until provisioning lands", () => {
    expect(shouldSendPendingMessage({ ...ready, sessionId: undefined })).toBe(false);
    expect(shouldSendPendingMessage(ready)).toBe(true);
  });

  // The ids arrive ~1s into a cold start; the sandbox takes ~14s more, and
  // POST /api/chat 400s "Sandbox not initialized" in between. Having a
  // sessionId is not the same as being able to send.
  it("does not send on ids alone while the sandbox is still provisioning", () => {
    expect(shouldSendPendingMessage({ ...ready, workspaceReady: false })).toBe(false);
  });
});
