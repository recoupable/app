import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

export interface CreateAgentTemplateBody {
  title: string;
  description: string;
  prompt: string;
  tags: string[];
  is_private: boolean;
  share_emails?: string[];
}

type CreateAgentTemplateResponse =
  | { status: "success"; template: AgentTemplateRow | null }
  | { status: "error"; error: string };

const createAgentTemplate = async (
  accessToken: string,
  body: CreateAgentTemplateBody,
): Promise<AgentTemplateRow | null> => {
  const res = await fetch(`${getClientApiBaseUrl()}/api/agents/templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res
    .json()
    .catch(() => null)) as CreateAgentTemplateResponse | null;

  if (!res.ok || data?.status !== "success") {
    throw new Error(
      (data?.status === "error" && data.error) || "Failed to create template",
    );
  }

  return data.template;
};

export default createAgentTemplate;
