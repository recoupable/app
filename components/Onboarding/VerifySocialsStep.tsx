"use client";

import { useRouter } from "next/navigation";
import { getProfileSetupArtists } from "@/lib/onboarding/getProfileSetupArtists";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArtistProfilePreferences } from "@/hooks/onboarding/useArtistProfilePreferences";
import { useSocialFix } from "@/hooks/onboarding/useSocialFix";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { hasLinkedSocial } from "@/lib/onboarding/hasLinkedSocial";
import ArtistSocialsCard from "./ArtistSocialsCard";
import SetupSkipLink from "./SetupSkipLink";

/** The fresh roster and the home gate share the same completion rule. */
const VerifySocialsStep = ({ onConfirmed }: { onConfirmed: () => void }) => {
  const {
    artists: roster,
    selectedArtist,
    isLoading,
    isError,
    getArtists,
  } = useArtistProvider();
  const artists = getProfileSetupArtists(roster, selectedArtist);
  const router = useRouter();
  const { fixSocial, fixingArtistId } = useSocialFix();
  const preferences = useArtistProfilePreferences();
  const [editingId, setEditingId] = useState<string | null>();
  const missingArtists = artists.filter(
    (artist) =>
      !hasLinkedSocial(artist) &&
      !preferences.artistIds.includes(artist.account_id),
  );
  const noProfileArtists = artists.filter(
    (artist) =>
      !hasLinkedSocial(artist) &&
      preferences.artistIds.includes(artist.account_id),
  );
  // Start with the first missing artist, and advance when a saved profile clears it.
  const activeId =
    editingId === null
      ? null
      : (missingArtists.find((artist) => artist.account_id === editingId)
          ?.account_id ?? missingArtists[0]?.account_id);
  const reviewedCount = artists.length - missingArtists.length;
  const connectedCount = artists.filter(hasLinkedSocial).length;
  const isSaving = fixingArtistId !== null || preferences.isSaving;
  const ready =
    !isLoading && !isError && preferences.isSuccess && artists.length > 0;
  const canContinue = ready && !isSaving && missingArtists.length === 0;

  const selectedProfileComplete = !!selectedArtist && canContinue;
  useEffect(() => {
    if (selectedProfileComplete) router.replace("/");
  }, [selectedProfileComplete, router]);

  if (selectedProfileComplete) return null;

  return (
    <section className="flex flex-col gap-7 sm:gap-8">
      <header className="flex flex-col gap-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-brand-link">
            <Link2 className="size-3.5" aria-hidden="true" />
          </span>
          Your roster / Profiles
        </div>
        <div>
          <h1 className="max-w-lg text-[clamp(2rem,4vw,3.25rem)] font-[450] leading-[1.08] tracking-[-0.045em] text-foreground">
            Connect your
            <br className="hidden sm:block" /> artist profiles.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Connect a profile, or let us know there isn’t one yet.
          </p>
        </div>
        {ready && (
          <div className="mt-1 max-w-md">
            <div className="mb-2.5 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check
                  className="size-3.5 text-brand-link"
                  aria-hidden="true"
                />
                {reviewedCount} of {artists.length} reviewed
              </span>
              <span className="font-mono text-[11px]">
                {missingArtists.length} to go
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Artist profiles reviewed"
              aria-valuemin={0}
              aria-valuemax={artists.length}
              aria-valuenow={reviewedCount}
              className="h-1.5 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-brand-link motion-safe:transition-[width] motion-safe:duration-300"
                style={{ width: `${(reviewedCount / artists.length) * 100}%` }}
              />
            </div>
            {noProfileArtists.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {connectedCount} connected · {noProfileArtists.length} with no
                profile yet
              </p>
            )}
          </div>
        )}
      </header>

      <div>
        {isLoading || preferences.isPending ? (
          <p role="status" className="rounded-2xl bg-secondary p-6 text-sm">
            Loading your artist profiles…
          </p>
        ) : isError || preferences.isError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl bg-secondary p-6 text-sm"
          >
            <p>
              {preferences.error?.message ||
                "We couldn’t load your setup. Please try again."}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                void getArtists().catch(() => undefined);
                void preferences.refetch();
              }}
            >
              Try again
            </Button>
          </div>
        ) : artists.length === 0 ? (
          <p className="text-sm">
            Add an artist to your roster first.{" "}
            <Link href="/setup/artists" className="text-brand-link underline">
              Add an artist
            </Link>
          </p>
        ) : missingArtists.length === 0 ? (
          <div
            role="status"
            className="flex items-center gap-3 rounded-2xl bg-secondary p-6"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-lime text-brand-on-lime">
              <Check className="size-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium">
              All artists reviewed. You’re ready to continue.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] bg-card shadow-[0_0_0_1px_var(--border),0_8px_30px_-20px_var(--muted-foreground)]">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
              <p
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 text-sm font-medium"
              >
                Missing profiles{" "}
                <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-brand-link">
                  {missingArtists.length}
                </span>
                <span className="sr-only">
                  {missingArtists.length === 1
                    ? "1 artist is"
                    : `${missingArtists.length} artists are`}{" "}
                  missing a profile.
                </span>
              </p>
              <span className="text-xs text-muted-foreground">
                Connect or choose “No profile yet”
              </span>
            </div>
            <div className="divide-y divide-border shadow-[0_-1px_0_var(--border)]">
              {missingArtists.map((artist) => (
                <ArtistSocialsCard
                  key={artist.account_id}
                  artist={artist}
                  isFixing={isSaving}
                  expanded={activeId === artist.account_id}
                  onToggle={() =>
                    setEditingId(
                      activeId === artist.account_id ? null : artist.account_id,
                    )
                  }
                  onFix={(url) => fixSocial(artist, url)}
                  onNoProfile={() =>
                    void preferences
                      .setNoProfile(artist.account_id, true)
                      .catch(() => undefined)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {ready && noProfileArtists.length > 0 && (
          <details className="mt-5 text-sm">
            <summary className="cursor-pointer py-2 text-muted-foreground">
              No profile yet ({noProfileArtists.length})
            </summary>
            <p className="mb-2 text-xs text-muted-foreground">
              Saved to your account. We won’t ask again for these artists.
            </p>
            <div className="divide-y divide-border">
              {noProfileArtists.map((artist) => (
                <div
                  key={artist.account_id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <span className="truncate">
                    {artist.name || "Untitled artist"}
                  </span>
                  <button
                    type="button"
                    disabled={isSaving}
                    aria-label={`Undo no profile for ${artist.name || "Untitled artist"}`}
                    onClick={() =>
                      void preferences
                        .setNoProfile(artist.account_id, false)
                        .catch(() => undefined)
                    }
                    className="min-h-9 shrink-0 text-brand-link underline underline-offset-4 disabled:opacity-50"
                  >
                    Undo
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}

        <footer className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5 py-1">
            <SetupSkipLink />
            <p className="text-[11px] text-muted-foreground">
              We may remind you next visit.
            </p>
          </div>
          <Button
            type="button"
            className="h-11 rounded-full px-6"
            disabled={!canContinue}
            onClick={() => {
              if (canContinue) onConfirmed();
            }}
          >
            {isSaving ? "Saving profile…" : "Continue setup"}
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Button>
        </footer>
      </div>
    </section>
  );
};

export default VerifySocialsStep;
