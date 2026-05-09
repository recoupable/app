import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

interface AgentTemplatesListResponse {
  status: "success" | "error";
  templates?: AgentTemplateRow[];
  error?: string;
}

const fetchAgentTemplates = async (
  accessToken: string,
): Promise<AgentTemplateRow[]> => {
  const res = await fetch(`${getClientApiBaseUrl()}/api/agent-templates`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data: AgentTemplatesListResponse = await res.json();

  if (!res.ok || data.status === "error") {
    throw new Error(data.error || "Failed to fetch agent templates");
  }

  return data.templates || [];
};

export default fetchAgentTemplates;
