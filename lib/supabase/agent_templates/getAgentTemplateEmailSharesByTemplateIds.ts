import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

type AgentTemplateEmailShare = Tables<"agent_template_email_shares">;

export async function getAgentTemplateEmailSharesByTemplateIds(
  templateIds: string[]
): Promise<AgentTemplateEmailShare[]> {
  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("agent_template_email_shares")
    .select("*")
    .in("template_id", templateIds);

  if (error) {
    console.error("Error fetching agent template email shares:", error);
    throw error;
  }

  return data || [];
}
