import { describe, expect, it } from "vitest";
import { getChatUrl } from "@/lib/chat/getChatUrl";

describe("getChatUrl", () => {
  it("builds an absolute session-scoped chat URL", () => {
    expect(getChatUrl("sess-1", "chat-2")).toBe(
      "https://chat.recoupable.dev/sessions/sess-1/chats/chat-2",
    );
  });
});
