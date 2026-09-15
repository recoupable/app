"use client";

import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useHomeValuation from "@/hooks/useHomeValuation";
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
  const { selectedArtist, artists, isLoading, isError } = useArtistProvider();
  const valuation = useHomeValuation();

  const prompts =
    !selectedArtist && !artists.length && !isLoading && !isError
      ? [
          {
            label: "What can Recoup do?",
            prompt:
              "What can Recoup help me do? Show me a few practical ways to get started.",
          },
          {
            label: "Plan a release",
            prompt:
              "Help me plan a music release. Ask me about the artist, timeline, and goals first.",
          },
        ]
      : getHomeSuggestedPrompts({
          hasValuation: valuation.show,
          hasRuns: false,
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
