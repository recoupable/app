import type { CreateTaskParams } from "@/lib/tasks/createTask";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

interface BuildStarterTaskParamsInput {
  template: AgentTemplateRow;
  artistName: string;
  artistAccountId: string;
}

/**
 * The pre-wired one-click suggestion shown in the homepage tasks module's
 * empty state (recoupable/chat#1850). The prompt is the chosen /agents
 * template's prompt verbatim (DRY — see findStarterTemplate); only the
 * title is personalized so the task list reads per-artist.
 */
export function buildStarterTaskParams({
  template,
  artistName,
  artistAccountId,
}: BuildStarterTaskParamsInput): Omit<CreateTaskParams, "model"> {
  return {
    title: `${template.title} — ${artistName}`,
    prompt: template.prompt,
    schedule: "0 9 * * 1",
    artist_account_id: artistAccountId,
  };
}
