import { NEW_API_BASE_URL } from "@/lib/consts";

export type UpdateChatParams = {
  accessToken: string;
  chatId: string;
  topic: string;
};

export type UpdateChatResponse = {
  status: "success" | "error";
  chat?: {
    id: string;
    account_id: string;
    topic: string;
    updated_at: string;
    artist_id: string | null;
  };
  error?: string;
};

/**
 *
 * @param root0
 * @param root0.accessToken
 * @param root0.chatId
 * @param root0.topic
 */
export async function updateChat({
  accessToken,
  chatId,
  topic,
}: UpdateChatParams): Promise<UpdateChatResponse> {
  const response = await fetch(`${NEW_API_BASE_URL}/api/chats`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      chatId,
      topic,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update chat");
  }

  return response.json();
}
