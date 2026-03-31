import { deleteMemoriesByRoomIdAfterTimestamp } from "../supabase/deleteMemoriesByChatIdAfterTimestamp";
import { getMemoryById } from "../supabase/getMemoryById";

export async function deleteTrailingMessages({ id }: { id: string }) {
  const memory = await getMemoryById({ id });

  if (!memory) {
    throw new Error("Memory not found");
  }

  if (!memory.room_id) {
    throw new Error("Room ID not found");
  }

  await deleteMemoriesByRoomIdAfterTimestamp({
    roomId: memory.room_id,
    timestamp: new Date(memory.updated_at),
  });
}
