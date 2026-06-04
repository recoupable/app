import { describe, expect, it } from "vitest";
import { buildPatchChatBody } from "@/lib/chats/buildPatchChatBody";

describe("buildPatchChatBody", () => {
  it("includes only provided fields", () => {
    expect(buildPatchChatBody({ title: "My chat" })).toEqual({
      title: "My chat",
    });
    expect(
      buildPatchChatBody({ modelId: "anthropic/claude-opus-4.6" }),
    ).toEqual({ modelId: "anthropic/claude-opus-4.6" });
    expect(
      buildPatchChatBody({
        title: "My chat",
        modelId: "openai/gpt-5.4-mini",
      }),
    ).toEqual({ title: "My chat", modelId: "openai/gpt-5.4-mini" });
  });

  it("throws when no fields are provided", () => {
    expect(() => buildPatchChatBody({})).toThrow(
      "At least one of title or modelId is required",
    );
  });
});
