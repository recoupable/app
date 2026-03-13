import { getRooms } from "@/lib/supabase/rooms/getRooms";
import { getMemories } from "@/lib/supabase/memories/getMemories";
import { sendDailyStatsMessage } from "@/lib/telegram/sendDailyStatsMessage";

export interface DailyStats {
  newRoomsCount: number;
  prevRoomsCount: number;
  roomsDelta: number;
  newMemoriesCount: number;
  prevMemoriesCount: number;
  memoriesDelta: number;
}

/**
 * Calculates daily stats and deltas for rooms and memories.
 */
export async function handleDailyStats(): Promise<DailyStats> {
  const now = Date.now();
  const startDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const prevStartDate = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();

  const [rooms, prevRooms, memories, prevMemories] = await Promise.all([
    getRooms({ startDate }),
    getRooms({ startDate: prevStartDate, endDate: startDate }),
    getMemories({ startDate }),
    getMemories({ startDate: prevStartDate, endDate: startDate }),
  ]);

  const newRoomsCount = rooms.length;
  const prevRoomsCount = prevRooms.length;
  const roomsDelta =
    prevRoomsCount === 0 ? 0 : ((newRoomsCount - prevRoomsCount) / prevRoomsCount) * 100;
  const newMemoriesCount = memories.length;
  const prevMemoriesCount = prevMemories.length;
  const memoriesDelta =
    prevMemoriesCount === 0
      ? 0
      : ((newMemoriesCount - prevMemoriesCount) / prevMemoriesCount) * 100;

  const stats = {
    newRoomsCount,
    prevRoomsCount,
    roomsDelta,
    newMemoriesCount,
    prevMemoriesCount,
    memoriesDelta,
  };
  await sendDailyStatsMessage(stats);

  return stats;
}
