import { siteTable } from "./siteTable";
import type { Site } from "@/lib/sites/schema";
export async function selectSite(id: string) {
  const { data, error } = await siteTable()
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Could not load site");
  return data as Site | null;
}
