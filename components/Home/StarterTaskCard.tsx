"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import { useCreateStarterTask } from "@/hooks/useCreateStarterTask";

/**
 * Empty-state suggestion for the homepage tasks module: one click
 * schedules the monthly report for the selected artist, on the date and
 * time of the click (recoupable/app#1941), via the existing task-creation path (recoupable/chat#1850). The copy is
 * the card's own and describes the report it actually schedules
 * (chat#2006).
 */
const StarterTaskCard = () => {
  const { selectedArtist } = useArtistProvider();
  const { handleCreateStarterTask, isCreating, isPreparing, isScheduled } =
    useCreateStarterTask();
  const artistName = selectedArtist?.name || "your artist";

  if (isScheduled) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Scheduled: Monthly Catalog Report for {artistName}.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-foreground">
          Monthly Catalog Report for {artistName}
        </p>
        <p className="text-xs text-muted-foreground">
          Streams gained, month over month, and top social posts, emailed to you
          once a month, starting a month from today.
        </p>
      </div>
      <button
        type="button"
        onClick={() => handleCreateStarterTask()}
        disabled={isCreating || isPreparing}
        className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreating ? "Scheduling..." : "Schedule it"}
      </button>
    </div>
  );
};

export default StarterTaskCard;
