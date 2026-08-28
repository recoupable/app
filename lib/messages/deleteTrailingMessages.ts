import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export class TrailingDeleteError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TrailingDeleteError";
    this.status = status;
  }
}

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
    throw new TrailingDeleteError(
      "Failed to delete trailing messages",
      response.status,
    );
  }
}
