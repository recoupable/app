import supabase from "../serverClient";

/**
 * Returns all memories updated at or after the given timestamp.
 *
 * @param since - ISO timestamp string (UTC)
 * @param since.startDate
 * @param since.endDate
 */
export async function getMemories({ startDate, endDate }: { startDate: string; endDate?: string }) {
  let query = supabase.from("memories").select("*");

  if (startDate) query = query.gte("updated_at", startDate);
  if (endDate) query = query.lte("updated_at", endDate);
  const { data, error } = await query;

  if (error) throw error;
  return data;
}
