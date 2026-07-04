import { describe, it, expect } from "vitest";
import { shouldAutoSendInitialMessage } from "@/lib/chat/shouldAutoSendInitialMessage";

const ready = {
  hasInitialMessages: true,
  status: "ready",
  messagesLength: 0,
  userId: "acct-1",
  authenticated: true,
  sessionId: "sess-1",
};

describe("shouldAutoSendInitialMessage", () => {
  it("sends when authenticated, ready, and the session is provisioned", () => {
    expect(shouldAutoSendInitialMessage(ready)).toBe(true);
  });

  it("does NOT send while the bootstrap session is still provisioning (chat#1847)", () => {
    expect(
      shouldAutoSendInitialMessage({ ...ready, sessionId: undefined }),
    ).toBe(false);
  });

  it("does not send without an initial message", () => {
    expect(
      shouldAutoSendInitialMessage({ ...ready, hasInitialMessages: false }),
    ).toBe(false);
  });

  it("does not send while the chat transport is busy", () => {
    expect(
      shouldAutoSendInitialMessage({ ...ready, status: "streaming" }),
    ).toBe(false);
  });

  it("does not re-send once the conversation has messages", () => {
    expect(shouldAutoSendInitialMessage({ ...ready, messagesLength: 2 })).toBe(
      false,
    );
  });

  it("does not send before login completes", () => {
    expect(shouldAutoSendInitialMessage({ ...ready, userId: undefined })).toBe(
      false,
    );
    expect(
      shouldAutoSendInitialMessage({ ...ready, authenticated: false }),
    ).toBe(false);
  });
});
