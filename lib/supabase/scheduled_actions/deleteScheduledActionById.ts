import supabase from "@/lib/supabase/serverClient";

export async function deleteScheduledActionById(id: string) {
  return supabase.from("scheduled_actions").delete().eq("id", id);
}
