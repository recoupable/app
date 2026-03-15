import supabase from "@/lib/supabase/serverClient";

/**
 *
 * @param id
 * @param userId
 */
export async function verifyAgentTemplateOwner(id: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("agent_templates")
    .select("id, creator")
    .eq("id", id)
    .single();
  if (error) throw error;
  return Boolean(data && data.creator === userId);
}
