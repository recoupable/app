/**
 * Phase 2 backfill: migrate rooms + memories → sessions + chats + chat_messages
 *
 * Run with:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm backfill:rooms-to-sessions
 *
 * Fully idempotent: safe to re-run after partial failures.
 */

import { selectAllRooms } from "@/lib/supabase/rooms/selectAllRooms";
import { migrateRoom } from "./backfill/migrateRoom";
import { MigrationResult } from "./backfill/types";

async function main() {
  console.log(
    "🚀 Starting Phase 2 backfill: rooms → sessions/chats/chat_messages\n",
  );

  const rooms = await selectAllRooms();
  console.log(`Found ${rooms.length} rooms to process\n`);

  const counts: Record<MigrationResult, number> = {
    migrated: 0,
    skipped: 0,
    failed: 0,
  };

  for (const room of rooms) {
    try {
      counts[await migrateRoom(room)]++;
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
