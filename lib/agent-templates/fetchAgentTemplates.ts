import type { AgentTemplateRow } from "@/types/AgentTemplates";
import { requestAgentTemplates } from "./requestAgentTemplates";

export default async function fetchAgentTemplates(
  apiBaseUrl: string,
  token: string,
  signal: AbortSignal,
): Promise<AgentTemplateRow[]> {
  const data = await requestAgentTemplates<{ templates: AgentTemplateRow[] }>(
    apiBaseUrl,
    token,
    signal,
  );
  if (!Array.isArray(data.templates))
    throw new Error("Unable to load agents. Please try again.");
  return data.templates;
}
