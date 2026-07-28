"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocialFix } from "@/hooks/onboarding/useSocialFix";
import { useArtistProvider } from "@/providers/ArtistProvider";
import ArtistSocialsCard from "./ArtistSocialsCard";

/**
 * Onboarding step: review the auto-matched socials for every rostered
 * artist. Matches are accepted by default — edit any that point at the
 * wrong account, or add one where none were found. Continue always
 * proceeds; an artist with no socials simply has none.
 *
 * Reads `isLoading` and renders skeletons, mirroring `ConfirmRosterStep`: the
 * step used to read only `sorted`, so a direct `/setup/socials` visit (the
 * welcome email's step 2 link) rendered a blank step that looked broken until
 * the roster arrived (chat#1889).
 */
const VerifySocialsStep = ({ onConfirmed }: { onConfirmed: () => void }) => {
  const { sorted, isLoading } = useArtistProvider();
  const artists = sorted.filter((artist) => !artist.isWorkspace);
  const { fixSocial, fixingArtistId } = useSocialFix();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Verify socials
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          These are the profiles we matched. Fix any that point at the wrong
          account — reports and tasks pull from them.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[104px] w-full rounded-xl" />
            <Skeleton className="h-[104px] w-full rounded-xl" />
          </>
        ) : (
          artists.map((artist) => (
            <ArtistSocialsCard
              key={artist.account_id}
              artist={artist}
              isFixing={fixingArtistId === artist.account_id}
              onFix={(url) => fixSocial(artist, url)}
            />
          ))
        )}
      </div>

      {!isLoading && (
        <Button type="button" className="w-full" onClick={onConfirmed}>
          Looks good — continue
        </Button>
      )}
    </section>
  );
};

export default VerifySocialsStep;
