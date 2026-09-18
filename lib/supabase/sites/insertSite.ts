import { siteTable } from "./siteTable";
import type { Site } from "@/lib/sites/schema";
export async function insertSite(
  input: Pick<
    Site,
    | "owner_id"
    | "created_by"
    | "artist_id"
    | "name"
    | "brief"
    | "release_url"
    | "assets"
  >,
) {
  const { data, error } = await siteTable().insert(input).select().single();
  if (error)
    throw new Error("Could not save site. Check the Sites database migration.");
  return data as Site;
}
