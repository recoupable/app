import supabase from "./serverClient";

export async function deleteMemoriesByRoomIdAfterTimestamp({
  roomId,
  timestamp,
}: {
  roomId: string;
  timestamp: Date;
}) {
  try {
    const { error, count } = await supabase
      .from("memories")
      .delete({ count: "exact" })
      .eq("room_id", roomId)
      .gte("updated_at", timestamp.toISOString());

    if (error) {
      console.error("Failed to delete memories:", error.message);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error(
      "Failed to delete memories by room_id after timestamp from database"
    );
    throw error;
  }
}
