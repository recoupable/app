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
          Connect missing artist profiles
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Setup checks that each artist has at least one linked profile so
          Recoup can find their music and social activity for reports.
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-muted p-4">
        <SetupSkipLink />
        <p className="text-sm text-muted-foreground">
          Go to chat for this session. Missing profiles stay on your setup
          checklist, and you may be asked to finish on your next visit.
        </p>
      </div>

      {isLoading ? (
        <p role="status">Loading your artist profiles…</p>
      ) : isError ? (
        <div role="alert" className="flex flex-col gap-3">
          <p>
            We couldn’t load your artists. Try again to check what’s missing.
          </p>
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
                  You’re here because{" "}
                  {missingArtists.length === 1
                    ? "1 artist is"
                    : `${missingArtists.length} artists are`}{" "}
                  missing a profile.
                </p>
                <p className="mt-1">
                  Only those artists are shown below. Search Spotify or paste
                  one profile link for each artist. Saved profiles are removed
                  from this list.
                </p>
              </>
            ) : (
              <p className="font-medium text-foreground">
                Every artist now has a linked profile. This step is complete.
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
            ? "Connect the missing profiles to continue"
            : "Continue setup"}
      </Button>
    </section>
  );
};

export default VerifySocialsStep;
