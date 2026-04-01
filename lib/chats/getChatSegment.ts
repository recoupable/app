import { NEW_API_BASE_URL } from "@/lib/consts";

interface ChatSegmentResponse {
  status: string;
  room_id: string;
  segment_id: string | null;
  segment_exists: boolean;
}

/**
 * Fetches the segment associated with a chat room.
 */
export async function getChatSegment(
  roomId: string,
  accessToken: string,
  baseUrl?: string,
): Promise<ChatSegmentResponse> {
  const url = baseUrl || NEW_API_BASE_URL;

  const response = await fetch(`${url}/api/chats/${encodeURIComponent(roomId)}/segment`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch segment ID");
  }

  return response.json();
}
