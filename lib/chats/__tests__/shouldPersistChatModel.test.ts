import { describe, expect, it } from "vitest";
import { shouldPersistChatModel } from "@/lib/chats/shouldPersistChatModel";

describe("shouldPersistChatModel", () => {
  it("persists when nothing has been persisted yet (new chat, first send)", () => {
    expect(shouldPersistChatModel(null, "chat-1", "anthropic/claude-opus-4.6")).toBe(true);
  });

  it("persists when the chat changed since the last persist", () => {
    expect(
      shouldPersistChatModel(
        { chatId: "chat-1", model: "anthropic/claude-opus-4.6" },
        "chat-2",
        "anthropic/claude-opus-4.6",
      ),
    ).toBe(true);
  });

  it("persists when the model changed for the same chat", () => {
    expect(
      shouldPersistChatModel(
        { chatId: "chat-1", model: "openai/gpt-5.4-mini" },
        "chat-1",
        "anthropic/claude-opus-4.6",
      ),
    ).toBe(true);
  });

  it("does not persist when the same model is already persisted for the same chat", () => {
    expect(
      shouldPersistChatModel(
        { chatId: "chat-1", model: "anthropic/claude-opus-4.6" },
        "chat-1",
        "anthropic/claude-opus-4.6",
      ),
    ).toBe(false);
  });
});
