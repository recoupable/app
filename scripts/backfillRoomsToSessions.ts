/**
 * Phase 2 backfill: migrate rooms + memories → sessions + chats + chat_messages
 *
 * Run with:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/backfillRoomsToSessions.ts
 *
 * Fully idempotent: safe to re-run after partial failures.
 */

import { supabase } from "./backfill/client";
import { paginate } from "./backfill/paginate";
import { migrateRoom } from "./backfill/migrateRoom";
import { MigrationResult, Room } from "./backfill/types";

async function main() {
  console.log("🚀 Starting Phase 2 backfill: rooms → sessions/chats/chat_messages\n");

  const rooms = await paginate<Room>((from, to) =>
    supabase
      .from("rooms")
      .select("id, account_id, topic, updated_at")
      .order("updated_at", { ascending: true })
      .range(from, to),
  );

  console.log(`Found ${rooms.length} rooms to process\n`);

  const counts: Record<MigrationResult, number> = { migrated: 0, skipped: 0, failed: 0 };

  for (const room of rooms) {
    try {
      const result = await migrateRoom(room);
      counts[result]++;
    } catch (err) {
      console.error(`❌ Failed to migrate room ${room.id}:`, err);
      counts.failed++;
    }
  }

  console.log(
    `\n📊 Done — migrated: ${counts.migrated}, skipped: ${counts.skipped}, failed: ${counts.failed}`,
  );

  if (counts.failed > 0) process.exit(1);
}

main();
