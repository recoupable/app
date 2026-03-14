import supabase from "./serverClient";

/**
 * Queries the memories table in Supabase
 *
 * @param roomId - The room ID to query memories for
 * @param options - Options for the query (ascending order and limit)
 * @param options.ascending
 * @param options.limit
 * @returns Supabase query result with memories data
 */
export default async function queryMemories(
  roomId: string,
  options?: {
    ascending?: boolean;
    limit?: number;
  },
) {
  const ascending = options?.ascending ?? false;
  const limit = options?.limit;

  let query = supabase
    .from("memories")
    .select("*")
    .eq("room_id", roomId)
    .order("updated_at", { ascending });

  if (limit) {
    query = query.limit(limit);
  }

  return query;
}
