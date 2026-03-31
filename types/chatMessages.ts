export interface CopyChatMessagesRequest {
  targetChatId: string;
  clearExisting?: boolean;
}

export interface CopyChatMessagesResponse {
  status: "success" | "error";
  source_chat_id?: string;
  target_chat_id?: string;
  copied_count?: number;
  cleared_existing?: boolean;
  error?: string;
}
