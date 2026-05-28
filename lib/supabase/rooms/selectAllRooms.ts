import supabase from "@/lib/supabase/serverClient";
import { paginate } from "@/lib/supabase/paginate";
import type { Tables } from "@/types/database.types";

export type BackfillRoom = Pick<
  Tables<"rooms">,
  "id" | "account_id" | "topic" | "updated_at"
>;

/**
 * All rooms for the Phase 2 backfill, oldest-first with `id` as a stable
 * secondary sort so paginated reads stay deterministic across re-runs.
 */
export async function selectAllRooms(): Promise<BackfillRoom[]> {
  return paginate<BackfillRoom>((from, to) =>
    supabase
      .from("rooms")
      .select("id, account_id, topic, updated_at")
      .order("updated_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to),
  );
}
