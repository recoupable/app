import { siteTable } from "./siteTable";
export async function selectSignups(siteId: string) {
  const { data, error } = await siteTable("site_signups")
    .select("email,created_at")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .limit(10000);
  if (error) throw new Error("Could not load signups");
  return data as { email: string; created_at: string }[];
}
