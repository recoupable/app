import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { isTrustedRecoupApiBaseUrl } from "@/lib/api/isTrustedRecoupApiBaseUrl";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

const fetchAgentTemplates = async (
  accessToken: string,
): Promise<AgentTemplateRow[]> => {
  const base = getClientApiBaseUrl();
  if (!isTrustedRecoupApiBaseUrl(base)) {
    throw new Error(
      "Refusing to attach credentials to untrusted Recoup API base URL.",
    );
  }
  const url = `${base.replace(/\/+$/, "")}/api/agent-templates`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch agent templates");
  return (await res.json()) as AgentTemplateRow[];
};

export default fetchAgentTemplates;
