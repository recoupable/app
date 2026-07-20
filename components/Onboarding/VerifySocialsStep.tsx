"use client";

import { Button } from "@/components/ui/button";
import { useSocialFix } from "@/hooks/onboarding/useSocialFix";
import { useSocialsVerification } from "@/hooks/onboarding/useSocialsVerification";
import { useArtistProvider } from "@/providers/ArtistProvider";
import ArtistSocialsCard from "./ArtistSocialsCard";

/**
 * Onboarding step: verify the auto-matched socials for every rostered
 * artist. Each match is confirmed or fixed (wrong auto-matches are a
 * known failure mode); artists without socials record an explicit none.
 */
const VerifySocialsStep = ({ onConfirmed }: { onConfirmed: () => void }) => {
  const { sorted } = useArtistProvider();
  const artists = sorted.filter((artist) => !artist.isWorkspace);
  const { state, setVerdict, markNone, isResolved, allResolved } =
    useSocialsVerification(artists);
  const { fixSocial, fixingArtistId } = useSocialFix((artistId, socialId) =>
    setVerdict(artistId, socialId, "confirmed"),
  );

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Verify socials
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          We auto-matched these profiles. Confirm each one, or fix any that
          point at the wrong account — reports and tasks pull from them.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {artists.map((artist) => (
          <ArtistSocialsCard
            key={artist.account_id}
            artist={artist}
            verification={state[artist.account_id]}
            isResolved={isResolved(artist)}
            isFixing={fixingArtistId === artist.account_id}
            onConfirm={(socialId) =>
              setVerdict(artist.account_id, socialId, "confirmed")
            }
            onReject={(socialId) =>
              setVerdict(artist.account_id, socialId, "rejected")
            }
            onMarkNone={() => markNone(artist.account_id)}
            onFix={(url) => fixSocial(artist, url)}
          />
        ))}
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={!allResolved}
        onClick={onConfirmed}
      >
        Socials verified — continue
      </Button>
    </section>
  );
};

export default VerifySocialsStep;
