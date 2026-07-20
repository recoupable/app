export interface HomeSuggestedPrompt {
  label: string;
  prompt: string;
}

interface GetHomeSuggestedPromptsParams {
  hasValuation: boolean;
  hasRuns: boolean;
  artistName: string;
  catalogName: string;
}

const MAX_PROMPTS = 3;

/**
 * Suggested prompt chips for the homepage command bar, wired to whichever
 * modules are visible (valuation hero, tasks module) so the chat's job is
 * interrogating the dashboard data (recoupable/chat#1850).
 */
export function getHomeSuggestedPrompts({
  hasValuation,
  hasRuns,
  artistName,
  catalogName,
}: GetHomeSuggestedPromptsParams): HomeSuggestedPrompt[] {
  const prompts: HomeSuggestedPrompt[] = [];

  if (hasValuation) {
    prompts.push({
      label: "Why did my valuation change?",
      prompt:
        "Why did my catalog valuation change? Walk through the latest " +
        "measurements and explain what moved the estimate.",
    });
  } else if (catalogName) {
    // The account already claimed a catalog: anchor the ask to that
    // catalog's data so the model reaches for the catalog toolset instead
    // of dead-ending on a generic estimate (recoupable/chat#1867).
    prompts.push({
      label: "What's my catalog worth?",
      prompt:
        `Estimate what my claimed catalog "${catalogName}" is worth. ` +
        "Start from the songs already in my Recoup catalog, then use " +
        "public streaming data, and tell me what's missing to tighten " +
        "the estimate.",
    });
  } else {
    prompts.push({
      label: "What's my catalog worth?",
      prompt: `Estimate the catalog value for ${
        artistName || "my roster"
      } from public streaming data.`,
    });
  }

  if (hasRuns) {
    prompts.push({
      label: "What did my last task run do?",
      prompt:
        "What did my last task run do? Summarize its output and anything it sent.",
    });
  }

  if (artistName) {
    prompts.push({
      label: `What should ${artistName} do this week?`,
      prompt:
        `Given ${artistName}'s latest streams and catalog value, ` +
        "what should we focus on this week?",
    });
  }

  return prompts.slice(0, MAX_PROMPTS);
}
