"use client";

import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useHomeValuation from "@/hooks/useHomeValuation";
import useHomeTasksModuleState from "@/hooks/useHomeTasksModuleState";
import { getHomeSuggestedPrompts } from "@/lib/home/getHomeSuggestedPrompts";

/**
 * Suggested prompt chips for the homepage command bar (recoupable/chat#1850).
 * Fully self-contained per the KISS review: module relevance comes from the
 * same provider-backed hooks the header uses (react-query dedupes by key),
 * and clicking a chip prefills the existing chat input via the provider's
 * `setInput` — the send itself goes through the untouched send path. Renders
 * nothing when no module has data, so no mount needs to know it exists.
 */
const HomeSuggestedPrompts = () => {
  const { setInput } = useVercelChatContext();
  const { selectedArtist } = useArtistProvider();
  const valuation = useHomeValuation();
  const tasksState = useHomeTasksModuleState();

  const prompts = getHomeSuggestedPrompts({
    hasValuation: valuation.show,
    hasRuns: tasksState.view === "runs",
    artistName: selectedArtist?.name || "",
  });

  if (prompts.length === 0) return null;

  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="group"
      aria-label="Suggested prompts"
    >
      {prompts.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => setInput(p.prompt)}
          className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-[0px_0px_0px_1px_var(--border)] transition-colors hover:bg-muted"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

export default HomeSuggestedPrompts;
