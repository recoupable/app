import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

export type ScheduledActionAuthRow = Pick<
  Tables<"scheduled_actions">,
  "id" | "account_id" | "artist_account_id"
>;

export async function selectScheduledActionById(id: string) {
  return supabase
    .from("scheduled_actions")
    .select("id, account_id, artist_account_id")
    .eq("id", id)
    .maybeSingle<ScheduledActionAuthRow>();
}
