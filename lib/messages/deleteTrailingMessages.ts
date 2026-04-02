import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Deletes trailing messages in a chat from a given message ID onward.
 */
export async function deleteTrailingMessages({
  chatId,
  fromMessageId,
  accessToken,
}: {
  chatId: string;
  fromMessageId: string;
  accessToken: string;
}): Promise<void> {
  const url = getClientApiBaseUrl();
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
    throw new Error("Failed to delete trailing messages");
  }
}
