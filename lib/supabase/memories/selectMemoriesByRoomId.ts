import supabase from "@/lib/supabase/serverClient";
import { paginate } from "@/lib/supabase/paginate";
import type { Tables } from "@/types/database.types";

export type BackfillMemory = Pick<
  Tables<"memories">,
  "id" | "content" | "updated_at"
>;

/** All memories for a room, oldest-first, used to backfill `chat_messages`. */
export async function selectMemoriesByRoomId(
  roomId: string,
): Promise<BackfillMemory[]> {
  return paginate<BackfillMemory>((from, to) =>
    supabase
      .from("memories")
      .select("id, content, updated_at")
      .eq("room_id", roomId)
      .order("updated_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to),
  );
}
