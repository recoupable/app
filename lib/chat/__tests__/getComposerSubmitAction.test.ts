import { describe, it, expect } from "vitest";
import { getComposerSubmitAction } from "@/lib/chat/getComposerSubmitAction";

const signedInReady = {
  authReady: true,
  authenticated: true,
  hasContent: true,
  isSendBlocked: false,
};

describe("getComposerSubmitAction", () => {
  it("sends when authenticated with content and nothing blocking", () => {
    expect(getComposerSubmitAction(signedInReady)).toBe("send");
  });

  it("prompts login when a signed-out visitor tries to send (chat#1902 C4)", () => {
    expect(
      getComposerSubmitAction({
        ...signedInReady,
        authenticated: false,
      }),
    ).toBe("prompt-login");
  });

  it("prompts login even while the workspace is blocked, since it never provisions for anonymous visitors", () => {
    expect(
      getComposerSubmitAction({
        ...signedInReady,
        authenticated: false,
        isSendBlocked: true,
      }),
    ).toBe("prompt-login");
  });

  it("stays disabled with an empty composer, signed in or out", () => {
    expect(
      getComposerSubmitAction({ ...signedInReady, hasContent: false }),
    ).toBe("disabled");
    expect(
      getComposerSubmitAction({
        ...signedInReady,
        authenticated: false,
        hasContent: false,
      }),
    ).toBe("disabled");
  });

  it("stays disabled while uploads or the workspace block an authenticated send", () => {
    expect(
      getComposerSubmitAction({ ...signedInReady, isSendBlocked: true }),
    ).toBe("disabled");
  });

  it("stays disabled until Privy is ready, so login() is never called mid-init", () => {
    expect(
      getComposerSubmitAction({
        ...signedInReady,
        authReady: false,
        authenticated: false,
      }),
    ).toBe("disabled");
  });
});
