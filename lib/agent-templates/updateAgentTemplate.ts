import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

export interface UpdateAgentTemplateBody {
  title?: string;
  description?: string;
  prompt?: string;
  tags?: string[];
  is_private?: boolean;
  share_emails?: string[];
}

type UpdateAgentTemplateResponse =
  | { status: "success"; template: AgentTemplateRow | null }
  | { status: "error"; error: string };

const updateAgentTemplate = async (
  accessToken: string,
  templateId: string,
  body: UpdateAgentTemplateBody,
): Promise<AgentTemplateRow | null> => {
  const res = await fetch(
    `${getClientApiBaseUrl()}/api/agents/templates/${templateId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    },
  );

  const data = (await res
    .json()
    .catch(() => null)) as UpdateAgentTemplateResponse | null;

  if (!res.ok || data?.status !== "success") {
    throw new Error(
      (data?.status === "error" && data.error) || "Failed to update template",
    );
  }

  return data.template;
};

export default updateAgentTemplate;
