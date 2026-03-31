import { NEW_API_BASE_URL } from "@/lib/consts";
import type {
  CopyChatMessagesRequest,
  CopyChatMessagesResponse,
} from "@/types/chatMessages";

/**
 * Client function to copy messages between rooms
 * @param sourceRoomId ID of the source room to copy messages from
 * @param targetRoomId ID of the target room to copy messages to
 * @returns Promise resolving to a boolean indicating success
 */
export async function copyMessages(
  sourceRoomId: string,
  targetRoomId: string,
  accessToken: string,
  baseUrl?: string,
): Promise<boolean> {
  try {
    const url = baseUrl || NEW_API_BASE_URL;
    const payload: CopyChatMessagesRequest = {
      targetChatId: targetRoomId,
      clearExisting: true,
    };

    const response = await fetch(
      `${url}/api/chats/${encodeURIComponent(sourceRoomId)}/messages/copy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const result: CopyChatMessagesResponse = await response.json();

    if (!response.ok) {
      console.error("Failed to copy messages:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error copying messages:", error);
    return false;
  }
}

export default copyMessages;
