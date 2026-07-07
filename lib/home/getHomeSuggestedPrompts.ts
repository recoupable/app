export interface HomeSuggestedPrompt {
  label: string;
  prompt: string;
}

interface GetHomeSuggestedPromptsParams {
  hasValuation: boolean;
  hasRuns: boolean;
  artistName: string;
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
}: GetHomeSuggestedPromptsParams): HomeSuggestedPrompt[] {
  const prompts: HomeSuggestedPrompt[] = [];

  if (hasValuation) {
    prompts.push({
      label: "Why did my valuation change?",
      prompt:
        "Why did my catalog valuation change? Walk through the latest " +
        "measurements and explain what moved the estimate.",
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
