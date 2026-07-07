import type { AgentTemplateRow } from "@/types/AgentTemplates";

/** Most-preferred first — the valuation report is the video's hero flow (chat#1850). */
const PREFERRED_TITLES = [
  "Weekly valuation + streams report",
  "Weekly Performance Dashboard",
];

/**
 * Picks the agent template behind the homepage starter task (DRY — the
 * task's prompt comes from the existing /agents templates, never a
 * hand-written string; recoupable/chat#1850 review). Prefers the weekly
 * valuation report, then the weekly dashboard, falls back to any
 * Report-tagged agent, and returns undefined (card hidden) when none exist.
 */
export function findStarterTemplate(
  templates: AgentTemplateRow[] | undefined,
): AgentTemplateRow | undefined {
  if (!templates?.length) return undefined;
  for (const title of PREFERRED_TITLES) {
    const match = templates.find((t) => t.title === title);
    if (match) return match;
  }
  return templates.find((t) => (t.tags ?? []).includes("Report"));
}
