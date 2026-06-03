import { describe, expect, it } from "vitest";
import { getChatPath } from "@/lib/chat/getChatPath";

describe("getChatPath", () => {
  it("builds a session-scoped chat path", () => {
    expect(getChatPath("sess-1", "chat-2")).toBe(
      "/sessions/sess-1/chats/chat-2",
    );
  });
});
