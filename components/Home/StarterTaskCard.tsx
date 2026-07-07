"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import { useCreateStarterTask } from "@/hooks/useCreateStarterTask";

/**
 * Empty-state suggestion for the homepage tasks module: one click
 * schedules an existing /agents Report template for the selected artist,
 * Mondays at 9am, via the existing task-creation path
 * (recoupable/chat#1850). Hidden when no Report template exists.
 */
const StarterTaskCard = () => {
  const { selectedArtist } = useArtistProvider();
  const { handleCreateStarterTask, isCreating, isScheduled, starterTemplate } =
    useCreateStarterTask();
  const artistName = selectedArtist?.name || "your artist";

  if (!starterTemplate) return null;

  if (isScheduled) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Scheduled: {starterTemplate.title} for {artistName}, Mondays at 9am.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-foreground">
          {starterTemplate.title} for {artistName}, Mondays
        </p>
        <p className="text-xs text-muted-foreground">
          {starterTemplate.description}
        </p>
      </div>
      <button
        type="button"
        onClick={() => handleCreateStarterTask()}
        disabled={isCreating}
        className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreating ? "Scheduling..." : "Schedule it"}
      </button>
    </div>
  );
};

export default StarterTaskCard;
