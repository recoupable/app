import supabase from "@/lib/supabase/serverClient";

interface AgentTemplateShare {
  id: string;
  template_id: string;
  user_id: string;
  created_at: string;
}

/**
 * Delete all agent template shares for a specific template
 *
 * @param templateId - The template ID to delete shares for
 * @returns Array of deleted share records
 */
export async function deleteAgentTemplateSharesByTemplateId(
  templateId: string,
): Promise<AgentTemplateShare[]> {
  const { data, error } = await supabase
    .from("agent_template_shares")
    .delete()
    .eq("template_id", templateId)
    .select();

  if (error) {
    console.error("Error deleting agent template shares:", error);
    throw error;
  }

  return (data as AgentTemplateShare[]) || [];
}
