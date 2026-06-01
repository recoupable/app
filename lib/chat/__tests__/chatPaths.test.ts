import {
  getChatPath,
  getChatUrl,
  isActiveChatRoomPath,
} from "@/lib/chat/chatPaths";

describe("chatPaths", () => {
  it("builds session-scoped chat paths and URLs", () => {
    expect(getChatPath("sess-1", "chat-2")).toBe(
      "/sessions/sess-1/chats/chat-2",
    );
    expect(getChatUrl("sess-1", "chat-2")).toBe(
      "https://chat.recoupable.com/sessions/sess-1/chats/chat-2",
    );
  });

  it("detects active chat room paths", () => {
    expect(isActiveChatRoomPath("/sessions/s1/chats/c1")).toBe(true);
    expect(isActiveChatRoomPath("/chat/legacy-id")).toBe(true);
    expect(isActiveChatRoomPath("/chat")).toBe(false);
    expect(isActiveChatRoomPath("/")).toBe(false);
    expect(isActiveChatRoomPath(null)).toBe(false);
  });
});
