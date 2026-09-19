import { siteTable } from "./siteTable";
import type { Site } from "@/lib/sites/schema";
export async function selectSites(ownerId: string, artistId?: string) {
  let query = siteTable()
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (artistId) query = query.eq("artist_id", artistId);
  const { data, error } = await query;
  if (error)
    throw new Error(
      "Could not load sites. Check the Sites database migration.",
    );
  return data as Site[];
}
