import supabase from "@/lib/supabase/serverClient";
import type { TablesInsert } from "@/types/database.types";

/**
 * Upserts chat messages (conflict on `id`). Tries one batch round-trip
 * first; if that fails, retries per-row so a single bad row doesn't block
 * the rest. Throws if any row ultimately fails. Returns the count upserted.
 */
export async function upsertChatMessages(
  rows: TablesInsert<"chat_messages">[],
): Promise<number> {
  if (rows.length === 0) return 0;

  const { error: batchError } = await supabase
    .from("chat_messages")
    .upsert(rows, { onConflict: "id" });
  if (!batchError) return rows.length;

  console.warn(
    "⚠️  Batch chat_messages upsert failed, retrying per-row:",
    batchError.message,
  );

  let succeeded = 0;
  for (const row of rows) {
    const { error } = await supabase
      .from("chat_messages")
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`  ❌ Skipping message ${row.id}:`, error.message);
    } else {
      succeeded++;
    }
  }

  if (succeeded !== rows.length) {
    throw new Error(
      `Failed to upsert ${rows.length - succeeded} of ${rows.length} chat_messages`,
    );
  }
  return succeeded;
}
