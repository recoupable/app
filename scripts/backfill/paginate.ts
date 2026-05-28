import type { PostgrestResponse } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;

/**
 * Fetches all rows from a Supabase query by looping with .range() until
 * fewer than PAGE_SIZE rows are returned. Required because PostgREST caps
 * responses at 1,000 rows by default.
 */
export async function paginate<T>(
  queryFn: (from: number, to: number) => PromiseLike<PostgrestResponse<T>>,
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await queryFn(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}
