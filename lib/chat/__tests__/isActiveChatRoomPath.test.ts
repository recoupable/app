import { describe, expect, it } from "vitest";
import { isActiveChatRoomPath } from "@/lib/chat/isActiveChatRoomPath";

describe("isActiveChatRoomPath", () => {
  it("detects active chat room paths", () => {
    expect(isActiveChatRoomPath("/sessions/s1/chats/c1")).toBe(true);
    expect(isActiveChatRoomPath("/chat/legacy-id")).toBe(false);
    expect(isActiveChatRoomPath("/chat")).toBe(false);
    expect(isActiveChatRoomPath("/")).toBe(false);
    expect(isActiveChatRoomPath(null)).toBe(false);
  });
});
