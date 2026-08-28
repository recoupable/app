import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

type AgentTemplatesListResponse =
  | { status: "success"; templates: AgentTemplateRow[] }
  | { status: "error"; error: string };

const fetchAgentTemplates = async (
  accessToken: string,
): Promise<AgentTemplateRow[]> => {
  const res = await fetch(`${getClientApiBaseUrl()}/api/agents/templates`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await res
    .json()
    .catch(() => null)) as AgentTemplatesListResponse | null;

  if (!res.ok || data?.status !== "success") {
    throw new Error(
      (data?.status === "error" && data.error) ||
        "Failed to fetch agent templates",
    );
  }

  return data.templates;
};

export default fetchAgentTemplates;
