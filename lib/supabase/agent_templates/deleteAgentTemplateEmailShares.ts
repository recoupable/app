import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

type AgentTemplateEmailShare = Tables<"agent_template_email_shares">;

export async function deleteAgentTemplateEmailSharesByTemplateId(
  templateId: string
): Promise<AgentTemplateEmailShare[]> {
  const { data, error } = await supabase
    .from("agent_template_email_shares")
    .delete()
    .eq("template_id", templateId)
    .select("*");

  if (error) {
    console.error("Error deleting agent template email shares:", error);
    throw error;
  }

  return data || [];
}
