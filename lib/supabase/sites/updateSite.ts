import { siteTable } from "./siteTable";
import type { Site } from "@/lib/sites/schema";
/** Compare-and-swap prevents a slow generation overwriting a newer edit. */
export async function updateSite(
  id: string,
  ownerId: string,
  revision: number,
  changes: Partial<Pick<Site, "draft" | "published" | "published_at">>,
) {
  const { data, error } = await siteTable()
    .update({
      ...changes,
      revision: revision + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .eq("revision", revision)
    .select()
    .maybeSingle();
  if (error) throw new Error("Could not save changes");
  return data as Site | null;
}
