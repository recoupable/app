"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocialFix } from "@/hooks/onboarding/useSocialFix";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { hasLinkedSocial } from "@/lib/onboarding/hasLinkedSocial";
import ArtistSocialsCard from "./ArtistSocialsCard";
import SetupSkipLink from "./SetupSkipLink";

/** The fresh roster and the home gate share the same completion rule. */
const VerifySocialsStep = ({ onConfirmed }: { onConfirmed: () => void }) => {
  const { artists, isLoading, isError, getArtists } = useArtistProvider();
  const { fixSocial, fixingArtistId } = useSocialFix();
  const [editingId, setEditingId] = useState<string | null>();
  const missingArtists = artists.filter((artist) => !hasLinkedSocial(artist));
  // Start with the first missing artist, and advance when a saved profile clears it.
  const activeId =
    editingId === null
      ? null
      : (missingArtists.find((artist) => artist.account_id === editingId)
          ?.account_id ?? missingArtists[0]?.account_id);
  const connectedCount = artists.length - missingArtists.length;
  const isSaving = fixingArtistId !== null;
  const ready = !isLoading && !isError && artists.length > 0;
  const canContinue = ready && !isSaving && missingArtists.length === 0;

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
            A profile for each artist. Better insights for your roster.
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
                {connectedCount} of {artists.length} connected
              </span>
              <span className="font-mono text-[11px]">
                {missingArtists.length} to go
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Artists connected"
              aria-valuemin={0}
              aria-valuemax={artists.length}
              aria-valuenow={connectedCount}
              className="h-1.5 overflow-hidden rounded-full bg-secondary"
            >
              <div
                className="h-full rounded-full bg-brand-link motion-safe:transition-[width] motion-safe:duration-300"
                style={{ width: `${(connectedCount / artists.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <div>
        {isLoading ? (
          <p role="status" className="rounded-2xl bg-secondary p-6 text-sm">
            Loading your artist profiles…
          </p>
        ) : isError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl bg-secondary p-6 text-sm"
          >
            <p>We couldn’t load your artists. Please try again.</p>
            <Button
              variant="outline"
              onClick={() => void getArtists().catch(() => undefined)}
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
              All profiles connected. You’re ready to continue.
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
                Search Spotify or paste a link
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
                />
              ))}
            </div>
          </div>
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
