import type { AgentTemplateRow } from "@/types/AgentTemplates";

const PREFERRED_TITLE = "Weekly Performance Dashboard";

/**
 * Picks the agent template behind the homepage starter task (DRY — the
 * task's prompt comes from the existing /agents templates, never a
 * hand-written string; recoupable/chat#1850 review). Prefers the weekly
 * dashboard template, falls back to any Report-tagged agent, and returns
 * undefined (card hidden) when none exist.
 */
export function findStarterTemplate(
  templates: AgentTemplateRow[] | undefined,
): AgentTemplateRow | undefined {
  if (!templates?.length) return undefined;
  return (
    templates.find((t) => t.title === PREFERRED_TITLE) ??
    templates.find((t) => (t.tags ?? []).includes("Report"))
  );
}
