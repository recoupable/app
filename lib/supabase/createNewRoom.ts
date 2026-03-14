import supabase from "./serverClient";
import generateUUID from "../generateUUID";

/**
 * Interface for room creation parameters
 */
interface CreateRoomParams {
  id?: string; // Optional: provide a specific ID, otherwise one will be generated
  account_id: string; // Required: the account ID associated with the room
  artist_id: string; // Required: the artist ID associated with the room
  topic?: string; // Optional: the topic/name of the conversation
}

/**
 * Creates a new room in the database
 *
 * @param params - Parameters for room creation
 * @returns The ID of the newly created room or null if creation failed
 */
export async function createNewRoom(params: CreateRoomParams): Promise<string | null> {
  try {
    const { account_id, artist_id } = params;

    if (!account_id || !artist_id) {
      console.error("Missing required parameters for room creation");
      return null;
    }

    // Generate an ID if one isn't provided
    const roomId = params.id || generateUUID();

    // Prepare room data
    const roomData = {
      id: roomId,
      account_id,
      artist_id,
      topic: params.topic || "New conversation",
    };

    // Create the room
    const { error } = await supabase.from("rooms").insert(roomData);

    if (error) {
      console.error("Error creating room:", error);
      return null;
    }

    return roomId;
  } catch (error) {
    console.error("Unexpected error in createNewRoom:", error);
    return null;
  }
}

export default createNewRoom;
