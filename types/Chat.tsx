export type MemoryContent = {
  optimistic?: boolean;
  parts?: { text: string }[];
};

export type Conversation = {
  topic: string;
  id: string;
  /**
   * Session that owns this chat. Used to build the canonical
   * `/sessions/{sessionId}/chats/{id}` URL.
   */
  sessionId: string;
  account_id: string;
  /**
   * Artist account this chat belongs to (mirrors `sessions.artist_id`).
   * Undefined when the owning session was created without an artist
   * context.
   */
  artist_id?: string;
  /**
   * Optimistic-row marker. Live api responses arrive without memories;
   * `addOptimisticConversation` populates it for the pending state.
   */
  memories?: Array<{
    id: string;
    content: unknown;
    room_id: string;
    created_at: string;
  }>;
  updated_at: string;
};

export type MessageFileAttachment =
  | {
      type: "file";
      data: URL;
      mimeType: string;
    }
  | {
      type: "image";
      image: string;
    };

export interface CreateChatRequest {
  artistId?: string;
  chatId?: string;
  firstMessage?: string;
}

export interface CreateChatResponse {
  status: "success" | "error";
  chat?: {
    id: string;
    topic: string | null;
  };
  error?: string;
  message?: string;
}
