import supabase from "@/lib/supabase/serverClient";

interface AgentTemplateShare {
  template_id: string;
  user_id: string;
  created_at: string;
}

/**
 * Get all agent template shares for specific template IDs
 *
 * @param templateIds - Array of template IDs to get shares for
 * @returns Array of share records
 */
export async function getAgentTemplateSharesByTemplateIds(
  templateIds: string[],
): Promise<AgentTemplateShare[]> {
  if (!Array.isArray(templateIds) || templateIds.length === 0) return [];

  const { data, error } = await supabase
    .from("agent_template_shares")
    .select("template_id, user_id, created_at")
    .in("template_id", templateIds);

  if (error) {
    console.error("Error fetching agent template shares:", error);
    throw error;
  }

  return (data as AgentTemplateShare[]) || [];
}
