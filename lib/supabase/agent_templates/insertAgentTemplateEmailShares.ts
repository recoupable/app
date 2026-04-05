import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

type AgentTemplateEmailShare = Tables<"agent_template_email_shares">;
type AgentTemplateEmailShareInsert = Tables<"agent_template_email_shares">["Insert"];

export async function insertAgentTemplateEmailShares(
  shares: AgentTemplateEmailShareInsert[]
): Promise<AgentTemplateEmailShare[]> {
  if (!Array.isArray(shares) || shares.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("agent_template_email_shares")
    .upsert(shares, {
      onConflict: "template_id,email",
      ignoreDuplicates: true,
    })
    .select("*");

  if (error) {
    console.error("Error inserting agent template email shares:", error);
    throw error;
  }

  return data || [];
}
