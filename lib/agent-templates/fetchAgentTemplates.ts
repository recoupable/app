import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

const fetchAgentTemplates = async (
  accessToken: string,
): Promise<AgentTemplateRow[]> => {
  const url = `${getClientApiBaseUrl().replace(/\/+$/, "")}/api/agent-templates`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch agent templates");
  return (await res.json()) as AgentTemplateRow[];
};

export default fetchAgentTemplates;
