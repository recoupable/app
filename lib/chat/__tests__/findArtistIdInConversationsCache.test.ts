import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { findArtistIdInConversationsCache } from "../findArtistIdInConversationsCache";
import type { Conversation } from "@/types/Chat";

describe("findArtistIdInConversationsCache", () => {
  it("returns artist_id when the chat is in a cached conversations list", () => {
    const queryClient = new QueryClient();
    const conversations: Conversation[] = [
      {
        id: "chat-1",
        topic: "Test",
        sessionId: "session-1",
        account_id: "user-1",
        artist_id: "artist-99",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];

    queryClient.setQueryData(["conversations", null], conversations);

    expect(findArtistIdInConversationsCache(queryClient, "chat-1")).toBe(
      "artist-99",
    );
  });

  it("returns undefined when the chat is missing or has no artist_id", () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(["conversations", "artist-1"], [
      {
        id: "chat-2",
        topic: "Other",
        sessionId: "session-2",
        account_id: "user-1",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ] as Conversation[]);

    expect(findArtistIdInConversationsCache(queryClient, "chat-1")).toBeUndefined();
  });
});
