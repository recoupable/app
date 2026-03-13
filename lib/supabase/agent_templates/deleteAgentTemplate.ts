import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param id
 */
export async function deleteAgentTemplate(id: string) {
  const { error } = await supabase.from("agent_templates").delete().eq("id", id);
  if (error) throw error;
  return { success: true } as const;
}
