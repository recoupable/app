/**
 * Client function to copy messages between rooms
 *
 * @param sourceRoomId - ID of the source room to copy messages from
 * @param targetRoomId - ID of the target room to copy messages to
 * @returns Promise resolving to a boolean indicating success
 */
export async function copyMessagesClient(
  sourceRoomId: string,
  targetRoomId: string,
): Promise<boolean> {
  try {
    const response = await fetch("/api/memories/copy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceRoomId,
        targetRoomId,
        clearExisting: true,
      }),
    });

    if (!response.ok) {
      console.error("Failed to copy messages:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error copying messages:", error);
    return false;
  }
}

export default copyMessagesClient;
