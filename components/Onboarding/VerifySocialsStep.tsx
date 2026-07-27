"use client";

import { Button } from "@/components/ui/button";
import { useSocialFix } from "@/hooks/onboarding/useSocialFix";
import { useSocialRemove } from "@/hooks/onboarding/useSocialRemove";
import { useArtistProvider } from "@/providers/ArtistProvider";
import ArtistSocialsCard from "./ArtistSocialsCard";

/**
 * Onboarding step: review the auto-matched socials for every rostered
 * artist. Matches are accepted by default — edit any that point at the
 * wrong account, or add one where none were found. Continue always
 * proceeds; an artist with no socials simply has none.
 */
const VerifySocialsStep = ({ onConfirmed }: { onConfirmed: () => void }) => {
  const { sorted } = useArtistProvider();
  const artists = sorted.filter((artist) => !artist.isWorkspace);
  const { fixSocial, fixingArtistId } = useSocialFix();
  const { removeSocial, removingSocialId } = useSocialRemove();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Verify socials
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          These are the profiles we matched. Fix any that point at the wrong
          account. Reports and tasks pull from them.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {artists.map((artist) => (
          <ArtistSocialsCard
            key={artist.account_id}
            artist={artist}
            isFixing={
              fixingArtistId === artist.account_id || removingSocialId !== null
            }
            onFix={(url) => fixSocial(artist, url)}
            onRemove={(socialId) => removeSocial(artist, socialId)}
          />
        ))}
      </div>

      <Button type="button" className="w-full" onClick={onConfirmed}>
        Looks good, continue
      </Button>
    </section>
  );
};

export default VerifySocialsStep;
