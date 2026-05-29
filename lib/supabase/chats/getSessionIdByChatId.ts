import supabase from "../serverClient";

/**
 * Returns the session_id for a given chat id, or null if not found.
 * Used to route legacy /chat/[roomId] URLs through the new workflow
 * after the Phase 2 backfill (rooms → sessions/chats/chat_messages).
 */
export async function getSessionIdByChatId(
  chatId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("chats")
    .select("session_id")
    .eq("id", chatId)
    .single();

  if (error) return null;
  return (data as { session_id: string } | null)?.session_id ?? null;
}
