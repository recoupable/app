"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtistProvider } from "@/providers/ArtistProvider";
import AddArtistForm from "./AddArtistForm";
import RosterArtistRow from "./RosterArtistRow";

/**
 * Onboarding step: confirm the auto-created roster. Shows the artists
 * the valuation flow created, lets multi-artist managers add the rest,
 * and advances once the user confirms the list.
 */
const ConfirmRosterStep = ({ onConfirmed }: { onConfirmed: () => void }) => {
  const { sorted, isLoading } = useArtistProvider();
  const artists = sorted.filter((artist) => !artist.isWorkspace);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Confirm your roster
        </h1>
        {/* Two-thirds of welcome-email signups arrive with an empty roster and
            never ran a valuation, so claiming we set one up from "your
            valuation" was simply false for them (chat#1889). */}
        <p className="text-sm text-muted-foreground mt-1">
          {artists.length === 0
            ? "Search Spotify for the artists you manage. Recoup uses them to measure your catalog, so pick the real profile."
            : `We set ${artists.length === 1 ? "this artist" : "these artists"} up from your valuation. Add anyone else you manage — you can verify their socials next.`}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[72px] w-full rounded-xl" />
            <Skeleton className="h-[72px] w-full rounded-xl" />
          </>
        ) : artists.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 rounded-xl border border-border">
            No artists on your roster yet. Add your first artist below to get
            your catalog valued.
          </p>
        ) : (
          artists.map((artist) => (
            <RosterArtistRow key={artist.account_id} artist={artist} />
          ))
        )}
        <AddArtistForm />
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={isLoading || artists.length === 0}
        onClick={onConfirmed}
      >
        {artists.length > 1 ? "These are my artists" : "This is my artist"} —
        continue
      </Button>
    </section>
  );
};

export default ConfirmRosterStep;
