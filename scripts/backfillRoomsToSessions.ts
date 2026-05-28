import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// Inline types — only the fields this script reads / writes
// ---------------------------------------------------------------------------

type Room = {
  id: string;
  account_id: string | null;
  topic: string | null;
  updated_at: string;
};

type Memory = {
  id: string;
  room_id: string | null;
  content: { role: string; parts: unknown };
  updated_at: string;
};

type MigrationResult = "migrated" | "skipped" | "failed";

// ---------------------------------------------------------------------------
// Supabase client (service-role, no Next.js module restrictions)
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Per-room migration (idempotent)
// ---------------------------------------------------------------------------

async function migrateRoom(room: Room): Promise<MigrationResult> {
  if (!room.account_id) {
    console.warn(`⚠️  Skipping room ${room.id} — no account_id`);
    return "skipped";
  }

  // Idempotency check: skip if a chat row already exists for this room
  const { data: existing, error: checkError } = await supabase
    .from("chats")
    .select("id")
    .eq("id", room.id)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    console.log(`⏭  Skipping room ${room.id} — already migrated`);
    return "skipped";
  }

  const sessionId = uuidv4();
  const title = room.topic ?? "Untitled";

  // 1. Insert session
  const { error: sessionError } = await supabase.from("sessions").insert({
    id: sessionId,
    account_id: room.account_id,
    title,
    created_at: room.updated_at,
    updated_at: room.updated_at,
  });
  if (sessionError) throw sessionError;

  // 2. Insert chat — preserve room.id so /chat/[roomId] URLs keep working
  const { error: chatError } = await supabase.from("chats").insert({
    id: room.id,
    session_id: sessionId,
    title,
    created_at: room.updated_at,
    updated_at: room.updated_at,
  });
  if (chatError) throw chatError;

  // 3. Migrate memories → chat_messages
  const { data: memories, error: memoriesError } = await supabase
    .from("memories")
    .select("id, room_id, content, updated_at")
    .eq("room_id", room.id);

  if (memoriesError) throw memoriesError;

  for (const memory of (memories ?? []) as Memory[]) {
    const { error: msgError } = await supabase
      .from("chat_messages")
      .upsert(
        {
          id: memory.id,
          chat_id: room.id,
          role: memory.content.role,
          parts: memory.content.parts,
          created_at: memory.updated_at,
        },
        { onConflict: "id" },
      );
    if (msgError) throw msgError;
  }

  console.log(
    `✅ Migrated room ${room.id} → session ${sessionId} (${(memories ?? []).length} messages)`,
  );
  return "migrated";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🚀 Starting Phase 2 backfill: rooms → sessions/chats/chat_messages\n");

  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id, account_id, topic, updated_at")
    .order("updated_at", { ascending: true });

  if (roomsError) {
    console.error("❌ Failed to fetch rooms:", roomsError.message);
    process.exit(1);
  }

  console.log(`Found ${rooms.length} rooms to process\n`);

  const counts = { migrated: 0, skipped: 0, failed: 0 };

  for (const room of rooms as Room[]) {
    try {
      const result = await migrateRoom(room);
      counts[result]++;
    } catch (err) {
      console.error(`❌ Failed to migrate room ${(room as Room).id}:`, err);
      counts.failed++;
    }
  }

  console.log(
    `\n📊 Done — migrated: ${counts.migrated}, skipped: ${counts.skipped}, failed: ${counts.failed}`,
  );

  if (counts.failed > 0) process.exit(1);
}

main();
