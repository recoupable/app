import supabase from "./serverClient";

/**
 * Gets the artist ID associated with a room
 *
 * @param roomId - The ID of the room to get the artist ID for
 * @returns The artist ID associated with the room, or null if not found
 */
export async function getRoomArtistId(roomId: string): Promise<string | null> {
  try {
    console.log(`Fetching artist ID for room: ${roomId}`);

    // Get the first room with matching ID to find the artist_id
    const { data, error } = await supabase
      .from("rooms")
      .select("artist_id")
      .eq("id", roomId)
      .maybeSingle();

    if (error) {
      console.error("Error getting room artist ID:", error.message);
      return null;
    }

    if (!data?.artist_id) {
      console.log(`No artist_id found for room: ${roomId}`);
      return null;
    }

    console.log(`Found artist_id: ${data.artist_id} for room: ${roomId}`);

    // Verify artist exists in the database
    const { data: artistExists, error: artistError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", data.artist_id)
      .single();

    if (artistError) {
      console.error("Artist not found:", artistError.message);
      return null;
    }

    if (!artistExists) {
      console.log(`Artist ${data.artist_id} does not exist in accounts table`);
      return null;
    }

    console.log(`Verified artist ${data.artist_id} exists`);
    return data.artist_id;
  } catch (error) {
    console.error("Unexpected error getting room artist ID:", error);
    return null;
  }
}
