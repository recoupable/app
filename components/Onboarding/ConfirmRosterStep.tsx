"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useCatalogs from "@/hooks/useCatalogs";
import { getConfirmRosterCopy } from "@/lib/onboarding/getConfirmRosterCopy";
import AddArtistForm from "./AddArtistForm";
import RosterArtistRow from "./RosterArtistRow";

/**
 * Onboarding step: confirm the auto-created roster. Shows the artists
 * the valuation flow created, lets multi-artist managers add the rest,
 * and advances once the user confirms the list.
 */
const ConfirmRosterStep = ({ onConfirmed }: { onConfirmed: () => void }) => {
  const { sorted: artists, isLoading } = useArtistProvider();
  const { data: catalogsData } = useCatalogs();
  const hasValuation = (catalogsData?.catalogs?.length ?? 0) > 0;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {!isLoading && artists.length === 0
            ? "Add your first artist"
            : "Confirm your roster"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {getConfirmRosterCopy({
            artistCount: artists.length,
            hasValuation,
          })}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[72px] w-full rounded-xl" />
            <Skeleton className="h-[72px] w-full rounded-xl" />
          </>
        ) : (
          artists.map((artist) => (
            <RosterArtistRow key={artist.account_id} artist={artist} />
          ))
        )}
        <AddArtistForm
          label={
            artists.length === 0
              ? "Add your first artist"
              : "Add another artist"
          }
        />
      </div>

      {artists.length > 0 && (
        <Button
          type="button"
          className="w-full"
          disabled={isLoading || artists.length === 0}
          onClick={onConfirmed}
        >
          {artists.length > 1 ? "These are my artists" : "This is my artist"},
          continue
        </Button>
      )}
    </section>
  );
};

export default ConfirmRosterStep;
