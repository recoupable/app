"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useRunValuation from "@/hooks/useRunValuation";

/**
 * One-click valuation run (chat#1973): POSTs /api/valuation for the resolved
 * roster artist. Disabled while a run is in flight, so a double click cannot
 * start two runs (the server side is idempotent regardless, api#844). A
 * failed run renders the API's error string verbatim — it is the diagnostic
 * (a 404 here exposed a wrong-duplicate Spotify profile in live use), never
 * to be hidden behind a generic failure state.
 *
 * Accounts with no roster artist carrying a Spotify profile fall back to the
 * /setup/artists route: there is no id to run against.
 */
const RunValuationButton = ({
  className,
  spotifyArtistId,
}: {
  className?: string;
  /** Run for this artist instead of the resolved roster artist (artist page). */
  spotifyArtistId?: string;
}) => {
  const { run, isRunning, error, canRun, artistName, rosterPending } =
    useRunValuation(spotifyArtistId);

  // An unresolved roster is not "no runnable artist" — deciding on a pending
  // roster would flash the setup route at accounts that can run.
  if (rosterPending && !canRun) return null;

  if (!canRun) {
    return (
      <Link href="/setup/artists" className={cn(buttonVariants(), "min-w-[200px]", className)}>
        Value your catalog
      </Link>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <button
        type="button"
        onClick={run}
        disabled={isRunning}
        aria-busy={isRunning}
        className={cn(buttonVariants(), "min-w-[200px]")}
      >
        {isRunning ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Measuring {artistName ?? "your catalog"}...
          </span>
        ) : (
          `Run valuation${artistName ? ` for ${artistName}` : ""}`
        )}
      </button>
      {error && (
        <p role="alert" className="max-w-md text-center text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default RunValuationButton;
