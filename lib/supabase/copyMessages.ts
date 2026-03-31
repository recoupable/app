import { generateUUID } from "../generateUUID";
import supabase from "./serverClient";

/**
 * Copies messages from source room to target room.
 */
async function copyMessages(
  sourceRoomId: string,
  targetRoomId: string,
  clearExisting: boolean,
): Promise<void> {
  try {
    const { data: messages } = await supabase
      .from("memories")
      .select("content, updated_at")
      .eq("room_id", sourceRoomId)
      .order("updated_at", { ascending: true });

    if (!messages || messages.length === 0) return;

    if (clearExisting) {
      await supabase.from("memories").delete().eq("room_id", targetRoomId);
    }

    const newMessages = messages.map((msg) => ({
      id: generateUUID(),
      room_id: targetRoomId,
      content: msg.content,
      updated_at: msg.updated_at,
    }));

    await supabase.from("memories").insert(newMessages);
  } catch (error) {
    console.error("Error copying room messages:", error);
  }
}

export default copyMessages;
