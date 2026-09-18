import supabase from "@/lib/supabase/serverClient";

// This table is introduced by database migration 20260918010000_sites.sql.
// Keep the ungenerated table name isolated until shared database types are refreshed.
export function siteTable(name: "sites" | "site_signups" = "sites") {
  return supabase.from(name);
}
