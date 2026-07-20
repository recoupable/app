export interface BuildFirstTaskPromptInput {
  artistName: string;
  catalogName?: string;
}

/**
 * The weekly catalog report brief used both for the onboarding pre-run
 * (fired through the normal chat pipeline) and as the scheduled task's
 * prompt — one string so the preview the user confirms is exactly what
 * the Monday run will produce (chat#1867, first-task step).
 */
export function buildFirstTaskPrompt({
  artistName,
  catalogName,
}: BuildFirstTaskPromptInput): string {
  const catalogClause = catalogName
    ? `the "${catalogName}" catalog`
    : "the claimed catalog";
  return [
    `Write this week's catalog report for ${artistName}, covering ${catalogClause}.`,
    "Structure it with clear markdown headings:",
    "1. Headline — the one number or change that matters most this week.",
    "2. Catalog performance — streams and listener trends across the catalog's releases, calling out top movers.",
    "3. What changed — anything new since last week (releases, playlists, notable spikes or drops).",
    "4. Recommended actions — 2-3 concrete next steps for the week ahead.",
    "Keep it concise and skimmable. If a data point is unavailable, say so briefly instead of guessing.",
  ].join("\n");
}
