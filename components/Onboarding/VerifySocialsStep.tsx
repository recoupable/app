"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSocialFix } from "@/hooks/onboarding/useSocialFix";
import { useSocialRemove } from "@/hooks/onboarding/useSocialRemove";
import { useArtistProvider } from "@/providers/ArtistProvider";
import ArtistSocialsCard from "./ArtistSocialsCard";
import SetupSkipLink from "./SetupSkipLink";
import { hasLinkedSocial } from "@/lib/onboarding/hasLinkedSocial";

/**
 * Resolve exactly the missing profiles that triggered the home setup gate.
 * Use the fresh roster, not the selected-artist snapshot in the sorted list.
 */
const VerifySocialsStep = ({ onConfirmed }: { onConfirmed: () => void }) => {
  const { artists, isLoading, isError, getArtists } = useArtistProvider();
  const { fixSocial, fixingArtistId } = useSocialFix();
  const { removeSocial, removingSocialId } = useSocialRemove();
  const missingArtists = artists.filter((artist) => !hasLinkedSocial(artist));
  const connectedCount = artists.length - missingArtists.length;
  const isSaving = fixingArtistId !== null || removingSocialId !== null;
  const canContinue =
    !isLoading &&
    !isError &&
    !isSaving &&
    artists.length > 0 &&
    missingArtists.length === 0;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Connect artist profiles
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add one profile per artist so Recoup can track their music and
          socials.
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-muted p-4">
        <SetupSkipLink />
        <p className="text-sm text-muted-foreground">
          Use chat now. We may ask again next visit.
        </p>
      </div>

      {isLoading ? (
        <p role="status">Loading your artist profiles…</p>
      ) : isError ? (
        <div role="alert" className="flex flex-col gap-3">
          <p>We couldn’t load your artists. Please try again.</p>
          <Button variant="outline" onClick={() => void getArtists()}>
            Try again
          </Button>
        </div>
      ) : artists.length === 0 ? (
        <p>
          Add an artist to your roster first.{" "}
          <Link href="/setup/artists" className="underline">
            Add an artist
          </Link>
        </p>
      ) : (
        <>
          <div
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            {missingArtists.length > 0 ? (
              <>
                <p className="font-medium text-foreground">
                  {missingArtists.length === 1
                    ? "1 artist is"
                    : `${missingArtists.length} artists are`}{" "}
                  missing a profile.
                </p>
                <p className="mt-1">
                  Search Spotify or paste a profile link below.
                </p>
              </>
            ) : (
              <p className="font-medium text-foreground">
                All profiles connected. You’re ready to continue.
              </p>
            )}
            <p className="mt-2">
              {connectedCount} of {artists.length} artists connected.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {missingArtists.map((artist) => (
              <ArtistSocialsCard
                key={artist.account_id}
                artist={artist}
                isFixing={isSaving}
                onFix={(url) => fixSocial(artist, url)}
                onRemove={(socialId) => removeSocial(artist, socialId)}
              />
            ))}
          </div>
        </>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={!canContinue}
        onClick={() => {
          if (canContinue) onConfirmed();
        }}
      >
        {isSaving
          ? "Saving profile…"
          : missingArtists.length > 0
            ? "Add profiles to continue"
            : "Continue setup"}
      </Button>
    </section>
  );
};

export default VerifySocialsStep;
