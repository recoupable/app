import supabase from "../serverClient";

/**
 * Returns all rooms updated at or after the given timestamp, and optionally up to an end date (inclusive).
 *
 * @param since - ISO timestamp string (UTC, lower bound)
 * @param since.startDate
 * @param endDate - ISO timestamp string (UTC, upper bound, inclusive)
 * @param since.endDate
 */
export async function getRooms({ startDate, endDate }: { startDate: string; endDate?: string }) {
  let query = supabase.from("rooms").select("*");

  if (startDate) query = query.gte("updated_at", startDate);
  if (endDate) query = query.lte("updated_at", endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
