import supabase from "@/lib/supabase/serverClient";
import type { TablesInsert } from "@/types/database.types";

/** Idempotent upsert of a single session row (conflict on `id`). */
export async function upsertSession(
  row: TablesInsert<"sessions">,
): Promise<void> {
  const { error } = await supabase
    .from("sessions")
    .upsert(row, { onConflict: "id" });
  if (error) throw error;
}
