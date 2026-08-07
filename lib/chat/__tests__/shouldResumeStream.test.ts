import { describe, it, expect } from "vitest";
import shouldResumeStream from "../shouldResumeStream";

describe("shouldResumeStream", () => {
  it("does not resume on a cold home-page load (no auth, no real chat)", () => {
    expect(
      shouldResumeStream({
        authenticated: false,
        routeChatId: undefined,
      }),
    ).toBe(false);
  });

  it("does not resume a client placeholder chat once auth resolves", () => {
    // The home page mounts <Chat> with a locally generated UUID before the
    // api has minted anything. Resuming it 404s: the row does not exist.
    expect(
      shouldResumeStream({
        authenticated: true,
        routeChatId: undefined,
      }),
    ).toBe(false);
  });

  it("does not resume a freshly bootstrapped chat", () => {
    // Verified on the preview deployment: gating on the bootstrap-minted id
    // made `resume` flip false -> true once provisioning resolved, and
    // `WorkflowChatTransport`'s `while (!gotFinish)` loop then reissued the
    // resume GET 118 times against a brand-new chat that returns 204. A chat
    // created seconds ago has no in-flight turn to re-attach to, so the
    // bootstrap id is deliberately not an input to this decision.
    expect(
      shouldResumeStream({
        authenticated: true,
        routeChatId: undefined,
      }),
    ).toBe(false);
  });

  it("does not resume before auth resolves, even on a real chat route", () => {
    // Privy's session resolves after mount; resuming here sends no
    // Authorization header and 401s.
    expect(
      shouldResumeStream({
        authenticated: false,
        routeChatId: "5c7f1e0a-1111-2222-3333-444455556666",
      }),
    ).toBe(false);
  });

  it("resumes an existing chat opened from the canonical session route", () => {
    // The only case a resume is for: you navigated back to a chat that may
    // still be mid-turn.
    expect(
      shouldResumeStream({
        authenticated: true,
        routeChatId: "5c7f1e0a-1111-2222-3333-444455556666",
      }),
    ).toBe(true);
  });
});
