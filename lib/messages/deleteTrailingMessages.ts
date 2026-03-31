import { NEW_API_BASE_URL } from "@/lib/consts";

/**
 * Deletes trailing messages in a chat from a given message ID onward.
 */
export async function deleteTrailingMessages({
  chatId,
  fromMessageId,
  accessToken,
  baseUrl,
}: {
  chatId: string;
  fromMessageId: string;
  accessToken: string;
  baseUrl?: string;
}): Promise<boolean> {
  const url = baseUrl || NEW_API_BASE_URL;
  const response = await fetch(
    `${url}/api/chats/${encodeURIComponent(chatId)}/messages/trailing?from_message_id=${encodeURIComponent(fromMessageId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error(errorData.error || "Failed to delete trailing messages");
    return false;
  }

  return true;
}
