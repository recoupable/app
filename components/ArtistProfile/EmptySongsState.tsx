"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import RunValuationButton from "@/components/Valuation/RunValuationButton";
import { getSpotifyIdFromUrl } from "@/lib/artist/getSpotifyIdFromUrl";
import { VALUATION_URL } from "@/lib/consts";
import type { ArtistProfileSocial } from "@/lib/recoup/getArtistProfile";

/**
 * The SONGS section when no catalog has songs yet (chat#1973): the page most
 * in need of the run button used to render nothing at all — a returning
 * customer added an artist, found no songs, no valuation and nothing to
 * click, and left. A signed-in viewer who rosters this artist gets the
 * one-click run for THIS artist; everyone else keeps the funnel CTA.
 *
 * The linked Spotify profile is shown alongside so a wrong-duplicate match is
 * spottable in one glance — a run 404ing with "No releases found for this
 * Spotify artist" against the shown profile is the diagnostic (live incident,
 * see chat#1973), and the fix path is verify-socials.
 */
const EmptySongsState = ({
  artistId,
  socials,
}: {
  artistId: string;
  socials: ArtistProfileSocial[];
}) => {
  const { sorted } = useArtistProvider();
  const spotifySocial = socials.find((social) => getSpotifyIdFromUrl(social.profile_url));
  const spotifyArtistId = getSpotifyIdFromUrl(spotifySocial?.profile_url);
  const rostersArtist = (sorted ?? []).some((artist) => artist.account_id === artistId);

  return (
    <section className="flex flex-col items-start gap-4 px-5 pb-12 md:px-12 md:pb-16">
      <h2 className="font-mono text-lg font-bold uppercase tracking-wide md:text-[22px]">Songs</h2>
      <p className="text-sm text-muted-foreground">
        No songs measured yet. A valuation measures this artist&apos;s releases and builds the
        catalog you see here.
      </p>
      {rostersArtist && spotifyArtistId ? (
        <>
          <RunValuationButton spotifyArtistId={spotifyArtistId} />
          {spotifySocial && (
            <p className="text-xs text-muted-foreground">
              Runs against the linked profile{" "}
              <a
                href={`https://${spotifySocial.profile_url.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {spotifySocial.profile_url.replace(/^https?:\/\//, "")}
              </a>
              . Wrong profile? <a href="/setup/socials" className="underline underline-offset-2">Fix it in verify socials</a>.
            </p>
          )}
        </>
      ) : (
        <a
          href={VALUATION_URL}
          className="flex items-center justify-center self-start rounded-xl bg-muted px-5 py-3.5 text-sm text-muted-foreground shadow-[0px_0px_0px_1px_var(--border)] transition-colors hover:text-foreground"
        >
          Get a free valuation for this catalog →
        </a>
      )}
    </section>
  );
};

export default EmptySongsState;
