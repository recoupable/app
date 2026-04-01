export type MemoryContent = {
  optimistic?: boolean;
  parts?: { text: string }[];
};

export type Conversation = {
  topic: string;
  id: string;
  account_id: string;
  artist_id: string;
  memories: Array<{
    id: string;
    content: unknown;
    room_id: string;
    created_at: string;
  }>;
  room_reports: Array<{
    report_id: string;
  }>;
  updated_at: string;
};

export type MessageFileAttachment = {
  type: "file";
  data: URL;
  mimeType: string;
} | {
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
