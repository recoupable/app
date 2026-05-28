import { v5 as uuidv5 } from "uuid";
import { supabase } from "./client";
import { paginate } from "./paginate";
import { Memory, MigrationResult, Room } from "./types";

// Fixed namespace for deterministic session ID generation.
// Using uuidv5(room.id, namespace) gives the same sessionId every run,
// so retries cannot create orphan sessions after a partial failure.
const SESSION_NAMESPACE = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

async function upsertMessages(roomId: string): Promise<number> {
  const memories = await paginate<Memory>((from, to) =>
    supabase
      .from("memories")
      .select("id, room_id, content, updated_at")
      .eq("room_id", roomId)
      .range(from, to),
  );

  for (const memory of memories) {
    const { error } = await supabase.from("chat_messages").upsert(
      {
        id: memory.id,
        chat_id: roomId,
        role: memory.content.role,
        parts: memory.content.parts,
        created_at: memory.updated_at,
      },
      { onConflict: "id" },
    );
    if (error) throw error;
  }

  return memories.length;
}

export async function migrateRoom(room: Room): Promise<MigrationResult> {
  if (!room.account_id) {
    console.warn(`⚠️  Skipping room ${room.id} — no account_id`);
    return "skipped";
  }

  // Deterministic ID: same room always produces the same session ID,
  // making all three upserts fully idempotent across retries.
  const sessionId = uuidv5(room.id, SESSION_NAMESPACE);
  const title = room.topic ?? "Untitled";

  const { error: sessionError } = await supabase.from("sessions").upsert(
    { id: sessionId, account_id: room.account_id, title, created_at: room.updated_at, updated_at: room.updated_at },
    { onConflict: "id" },
  );
  if (sessionError) throw sessionError;

  // Preserve room.id as chat.id so /chat/[roomId] URLs keep working
  const { error: chatError } = await supabase.from("chats").upsert(
    { id: room.id, session_id: sessionId, title, created_at: room.updated_at, updated_at: room.updated_at },
    { onConflict: "id" },
  );
  if (chatError) throw chatError;

  const count = await upsertMessages(room.id);
  console.log(`✅ Migrated room ${room.id} → session ${sessionId} (${count} messages)`);
  return "migrated";
}
