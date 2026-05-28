import supabase from "@/lib/supabase/serverClient";
import type { TablesInsert } from "@/types/database.types";

/** Idempotent upsert of a single chat row (conflict on `id`). */
export async function upsertChat(row: TablesInsert<"chats">): Promise<void> {
  const { error } = await supabase
    .from("chats")
    .upsert(row, { onConflict: "id" });
  if (error) throw error;
}
