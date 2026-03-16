import supabase from "@/lib/supabase/serverClient";

interface AgentTemplateShare {
  id: string;
  template_id: string;
  user_id: string;
  created_at: string;
}

interface AgentTemplateShareInsert {
  template_id: string;
  user_id: string;
}

/**
 * Insert multiple agent template shares
 *
 * @param shares - Array of share records to insert
 * @returns Array of inserted share records
 */
export async function insertAgentTemplateShares(
  shares: AgentTemplateShareInsert[],
): Promise<AgentTemplateShare[]> {
  if (!Array.isArray(shares) || shares.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("agent_template_shares")
    .upsert(shares, {
      onConflict: "template_id,user_id",
      ignoreDuplicates: true,
    })
    .select();

  if (error) {
    console.error("Error inserting agent template shares:", error);
    throw error;
  }

  return (data as AgentTemplateShare[]) || [];
}
