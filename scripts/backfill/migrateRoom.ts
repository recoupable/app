import { v5 as uuidv5 } from "uuid";
import { selectMemoriesByRoomId } from "@/lib/supabase/memories/selectMemoriesByRoomId";
import { upsertSession } from "@/lib/supabase/sessions/upsertSession";
import { upsertChat } from "@/lib/supabase/chats/upsertChat";
import { upsertChatMessages } from "@/lib/supabase/chat_messages/upsertChatMessages";
import type { BackfillRoom } from "@/lib/supabase/rooms/selectAllRooms";
import type { Json } from "@/types/database.types";
import { MigrationResult } from "./types";

// Fixed namespace for deterministic session ID generation.
// uuidv5(room.id, namespace) yields the same sessionId every run, so
// retries cannot create orphan sessions after a partial failure.
const SESSION_NAMESPACE = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

async function migrateMessages(roomId: string): Promise<number> {
  const memories = await selectMemoriesByRoomId(roomId);
  if (memories.length === 0) return 0;

  const rows = memories.map((memory) => {
    // Legacy memories store content as { role, parts, content } (see chat's
    // filterMessageContentForMemories); chat_messages wants role + parts.
    const content = memory.content as { role: string; parts: Json };
    return {
      id: memory.id,
      chat_id: roomId,
      role: content.role,
      parts: content.parts,
      created_at: memory.updated_at,
    };
  });

  return upsertChatMessages(rows);
}

export async function migrateRoom(
  room: BackfillRoom,
): Promise<MigrationResult> {
  if (!room.account_id) {
    console.warn(`⚠️  Skipping room ${room.id} — no account_id`);
    return "skipped";
  }

  // Deterministic ID makes all three upserts idempotent across retries.
  const sessionId = uuidv5(room.id, SESSION_NAMESPACE);
  const title = room.topic ?? "Untitled";

  await upsertSession({
    id: sessionId,
    account_id: room.account_id,
    title,
    created_at: room.updated_at,
    updated_at: room.updated_at,
  });

  // Preserve room.id as chat.id so /chat/[roomId] URLs keep working.
  await upsertChat({
    id: room.id,
    session_id: sessionId,
    title,
    created_at: room.updated_at,
    updated_at: room.updated_at,
  });

  const count = await migrateMessages(room.id);
  console.log(
    `✅ Migrated room ${room.id} → session ${sessionId} (${count} messages)`,
  );
  return "migrated";
}
