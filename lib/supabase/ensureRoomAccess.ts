import supabase from "./serverClient";
import getRoom from "./getRoom";
import createNewRoom from "./createNewRoom";
import copyRoomMessages from "./copyMessages";

/**
 * Ensures the user has access to a room by creating a copy of a shared room
 *
 * @param sourceRoomId - The ID of the original room being shared
 * @param accountId - The ID of the user to grant access to
 * @returns The ID of the user's room (new or existing)
 */
export async function ensureRoomAccess(
  sourceRoomId: string,
  accountId: string,
): Promise<string | null> {
  try {
    // Check for existing room
    const { data: existingRoom } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", sourceRoomId)
      .eq("account_id", accountId)
      .maybeSingle();

    // Check if room has messages
    if (existingRoom) {
      const { data: messages } = await supabase
        .from("memories")
        .select("id")
        .eq("room_id", sourceRoomId)
        .limit(1);

      if (messages && messages.length > 0) return sourceRoomId;
    }

    // Get source room data
    const roomData = await getRoom(sourceRoomId);
    if (!roomData?.topic) return null;

    // Use existing room ID or create a new room
    let roomId: string | null = null;

    if (existingRoom) {
      roomId = existingRoom.id;
    } else {
      // Create a new room using createNewRoom
      roomId = await createNewRoom({
        account_id: accountId,
        artist_id: roomData.artist_id,
        topic: roomData.topic,
      });
    }
    if (!roomId) return null;

    // Copy messages
    await copyRoomMessages(sourceRoomId, roomId, !!existingRoom);

    return roomId;
  } catch (error) {
    console.error("Error ensuring room access:", error);
    return null;
  }
}
