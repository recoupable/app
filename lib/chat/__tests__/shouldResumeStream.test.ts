import { describe, it, expect } from "vitest";
import shouldResumeStream from "../shouldResumeStream";

describe("shouldResumeStream", () => {
  it("does not resume on a cold home-page load (no auth, no real chat)", () => {
    expect(
      shouldResumeStream({
        authenticated: false,
        routeChatId: undefined,
        workflowChatId: undefined,
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
        workflowChatId: undefined,
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
        workflowChatId: undefined,
      }),
    ).toBe(false);
  });

  it("resumes an existing chat opened from the canonical session route", () => {
    expect(
      shouldResumeStream({
        authenticated: true,
        routeChatId: "5c7f1e0a-1111-2222-3333-444455556666",
        workflowChatId: undefined,
      }),
    ).toBe(true);
  });

  it("resumes once bootstrap mints a real chat id", () => {
    expect(
      shouldResumeStream({
        authenticated: true,
        routeChatId: undefined,
        workflowChatId: "9a8b7c6d-0000-1111-2222-333344445555",
      }),
    ).toBe(true);
  });
});
