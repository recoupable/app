import type { AgentTemplateRow } from "@/types/AgentTemplates";
import type { AccountWithDetails } from "@/lib/supabase/accounts/getAccountWithDetails";

const fetchAgentTemplates = async (userData: AccountWithDetails): Promise<AgentTemplateRow[]> => {
  const res = await fetch(`/api/agent-templates?userId=${userData?.id}`);
  if (!res.ok) throw new Error("Failed to fetch agent templates");
  return (await res.json()) as AgentTemplateRow[];
};

export default fetchAgentTemplates;
